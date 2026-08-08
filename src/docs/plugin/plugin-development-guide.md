---
title: MicYou 插件开发指南
description: 插件系统开发快速入门：双运行时、manifest、示例插件与开发工具
keywords: MicYou,插件开发,WASM,native,manifest,示例插件
---


面向插件作者的完整指南：Native 与 WASM 插件如何编写、Manifest 怎么写、Host API 怎么用、实时安全要求与跨端通信方法

## 目录

1. [目录结构](#目录结构)
2. [Manifest（plugin.json）](#manifestpluginjson)
3. [编写 Native 插件](#编写-native-插件)
4. [编写 WASM 插件](#编写-wasm-插件)
5. [Host API 使用](#host-api-使用)
6. [实时 DSP 插件规范](#实时-dsp-插件规范)
7. [跨端通信 API](#跨端通信-api)
8. [调试与测试](#调试与测试)

## 目录结构

```text
<插件目录>/
├── plugin.json          # 清单（必需）
├── <entry>              # 入口产物：libxxx.so / xxx.wasm（与清单 entry 一致）
└── assets/              # 可选私有资源
```

插件目录放在宿主的插件目录下，每个插件一个子目录，目录名建议与插件 id 一致：

- Linux: `~/.config/micyou/plugins/`
- Windows: `%APPDATA%\micyou\plugins\`
- macOS: `~/.config/micyou/plugins/`

## Manifest（plugin.json）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名，如 `dev.micyou.example.gain`，小写字母数字 + `.` `-`，必须含点 |
| `name` | string | 是 | 显示名 |
| `version` | string | 是 | SemVer |
| `author` | string | 否 | 作者 |
| `description` | string | 否 | 描述 |
| `runtime` | string | 是 | `native` 或 `wasm` |
| `entry` | string | 是 | 入口文件名（相对插件目录） |
| `platforms` | string[] | 否 | `linux` / `windows` / `macos` / `android`，空 = 全部 |
| `apiVersion` | number | 否 | Host API 版本，默认 1；与宿主不一致拒绝加载 |
| `capabilities` | string[] | 否 | 申请的能力，见 [API 参考](plugin-api-reference.md#权限清单) |
| `kind` | string | 否 | `dsp` / `utility` / `ui` / `bridge`，默认 `utility` |
| `ui` | object | 否 | UI 面板注册（kind 为 `ui` 时必填）：`{ route, label, entry? }` |
| `dsp` | object | 否 | DSP 节点注册（kind 为 `dsp`）：`{ insertAfter?, first?, frameSize?, realtimeSafe }` |
| `config` | object | 否 | 默认配置（首次启用时合并进插件配置） |

示例（Native DSP 插件）：

```json
{
  "id": "dev.micyou.example.gain",
  "name": "Example Native Gain",
  "version": "1.0.0",
  "author": "MicYou",
  "description": "可配置增益的 DSP 节点",
  "runtime": "native",
  "entry": "libmicyou_example_native_gain.so",
  "platforms": ["linux", "windows", "macos"],
  "apiVersion": 1,
  "capabilities": ["dsp.node", "config.read"],
  "kind": "dsp",
  "dsp": { "insertAfter": "AEC", "realtimeSafe": true },
  "config": { "gain": 2.0 }
}
```

校验规则（不满足即拒绝加载并给出原因）：

- id 必须合法反向域名格式
- version 必须合法 SemVer
- `apiVersion` 必须等于宿主 Host API 版本（当前 1）
- capabilities 必须是已知能力（未知能力拒绝）
- WASM DSP 插件不得声明 `realtimeSafe: true`
- `ui` 类型插件必须声明 `ui` 描述

### 配置表单自动生成（configSchema）

```json
"configSchema": {
  "fields": [
    { "key": "workMin", "fieldType": "number", "label": "工作时长", "min": 1, "max": 120, "step": 1, "default": 25 },
    { "key": "enabled", "fieldType": "boolean", "label": "启用", "default": true },
    { "key": "mode", "fieldType": "select", "options": [{ "value": "a", "label": "A" }] }
  ]
}
```

- 插件声明 schema 后无需手写设置页，宿主在插件卡片渲染原生风格表单
- 支持 number（滑杆）/ boolean（开关）/ string（输入）/ select（下拉）
- 保存走 set_plugin_config，配置热更新链路自动生效

### 插件依赖（dependencies）

```json
"dependencies": [
  { "id": "dev.micyou.effect", "version": "^1.0.0", "optional": false }
]
```

- 启用前宿主校验：依赖须已安装、已启用、版本满足 semver 约束
- optional=true 时缺失仅警告不阻塞；插件间调用复用 send_message 路由

### 更新机制（updateUrl）

- 声明 `updateUrl` 指向远端 manifest JSON，应用内「检查更新」做 semver 对比
- 有新版时一键更新：下载 zip → 替换安装目录 → 按原状态重新启用

### 运行时选择：WASM 优先

- **WASM（默认推荐）**：沙箱隔离、内存与燃料受限、跨平台（同一 .wasm 在
  Windows/macOS/Linux/未来 Android 通用）、能力由宿主授权
  - 适用：逻辑、UI 面板、自动化、定时任务、HTTP、文件（插件沙箱内）、配置
  - 性能：wasmi 解释器 100-500 Mops/s，48kHz 音频帧处理实测 ~70µs/帧（预算 10ms）
- **Native（cdylib）**：宿主完整权限，用于实时 DSP 与深度系统集成
  - 适用：自研降噪/变声算法、ONNX 推理、硬件交互
  - 要求：按平台分别编译（.so / .dylib / .dll），须声明 `arches`
  - 注意：process() 内禁止调用宿主 API（实时安全）

### 开发工具（micyou plugin）

```bash
micyou plugin create dev.micyou.myplugin          # 生成 wasm 骨架（默认）
micyou plugin create dev.micyou.mynative --runtime native
micyou plugin validate ./myplugin                 # 校验 plugin.json 与入口产物
micyou plugin package ./myplugin -o out.zip       # 打包为可导入 zip
```

- `create` 生成 plugin.json + 入口模板 + panel.html + README
- wasm 骨架：编译 main.wat → main.wasm 后放入目录即完成构建
- native 骨架：cargo build --release 后复制产物并按 entry 命名
- `package` 自动跳过 target/ 与隐藏文件，产物根目录含 plugin.json，应用内可直接导入

### 字段完整参考

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | 反向域名（如 dev.micyou.eq），小写字母数字与点连字符，须含点 |
| `name` | string | ✅ | 显示名 |
| `version` | string | ✅ | semver |
| `author` | string | | 作者（邮箱或昵称） |
| `description` | string | | 简述 |
| `license` | string | | SPDX 许可标识（如 MIT、GPL-3.0-only） |
| `homepage` | string | | 项目主页 |
| `repository` | string | | 源码仓库 |
| `keywords` | string[] | | 搜索关键词 |
| `runtime` | string | ✅ | `wasm` \| `native` |
| `entry` | string | ✅ | 入口产物文件名（相对插件目录） |
| `platforms` | string[] | | 支持系统，空 = 全部（linux / windows / macos / android） |
| `arches` | string[] | | **native 插件支持的 CPU 架构**（x86_64 / aarch64 / i686 / armv7 / riscv64），空 = 全部 |
| `apiVersion` | number | ✅ | 宿主 API 版本（当前 1） |
| `minHostVersion` | string | | 最低宿主 API 版本（semver，major 超过宿主即拒绝） |
| `capabilities` | string[] | | 请求的能力（见 API 参考权限清单） |
| `kind` | string | | `dsp` \| `utility` \| `ui` \| `bridge`，默认 utility |
| `ui` | object | | ui 描述（route / label / panels） |
| `dsp` | object | | dsp 描述（insertAfter / first / frameSize / realtimeSafe） |
| `config` | object | | 默认配置（首次启用时合入状态） |
| `icon` | string | | 图标文件名（PNG，相对插件目录） |
| `nameI18n` | object | | 本地化名称（BCP-47 标签 → 名称） |
| `descriptionI18n` | object | | 本地化描述（BCP-47 标签 → 描述） |
| `dependencies` | object[] | | 前置插件依赖 [{id, version, optional}]，启用前校验 |
| `configSchema` | object | | 声明式配置 schema，宿主自动生成设置表单 |
| `updateUrl` | string | | 远端 manifest JSON（更新检查与一键更新） |

示例（带新字段）：

```json
{
  "id": "dev.micyou.example.demo",
  "name": "Demo",
  "version": "1.0.0",
  "author": "you@example.com",
  "description": "示例插件",
  "license": "MIT",
  "homepage": "https://example.com",
  "keywords": ["demo", "utility"],
  "runtime": "wasm",
  "entry": "main.wasm",
  "platforms": ["linux", "windows", "macos"],
  "arches": ["x86_64", "aarch64"],
  "apiVersion": 1,
  "minHostVersion": "1.0.0",
  "capabilities": ["config.read", "config.write", "network.io"],
  "kind": "utility",
  "config": {},
  "nameI18n": { "zh-CN": "演示" }
}
```

## 编写 Native 插件

Native 插件是平台 cdylib，通过版本化 C ABI 与宿主交互，ABI 定义在
`micyou_plugin_abi.h`

### 必需符号

```c
// 静态插件身份（abiVersion 必须等于 1，apiVersion 必须等于 1，id 必须与 manifest 一致）
const mpl_plugin_info_t *micyou_plugin_info(void);

// 初始化：保存 host 回调表（生命周期内有效）
mpl_result_t micyou_plugin_init(const mpl_host_api_t *host);

// 反初始化（库卸载前调用一次）
void micyou_plugin_deinit(void);
```

### 可选符号（缺省视为旁路 / 无操作）

```c
// 实时 DSP：原地处理 samples 个交错 f32，bypass=1 表示本帧旁路
mpl_result_t micyou_plugin_process(float *data, uint32_t samples, uint32_t channels, double queued_ms, uint32_t *bypass);

// 本地事件通知（type 为事件类型，json 为负载）
mpl_result_t micyou_plugin_handle_event(const char *type, const char *json);

// 跨端消息（source 来源插件 id，topic 主题，payload 二进制负载）
mpl_result_t micyou_plugin_handle_message(const char *source, const char *topic, const uint8_t *payload, uint32_t payload_len);
```

### 完整最小示例（Rust）

`plugins/examples/native-gain/` 是完整可构建示例（`cargo build --release`），核心骨架：

```rust
#![allow(non_camel_case_types)]

use std::ffi::{c_char, c_void, CStr};

const MPL_ABI_VERSION: u32 = 1;
const MPL_API_VERSION: u32 = 1;
const PLUGIN_ID: &[u8] = b"dev.micyou.example.gain\0";

#[repr(C)]
#[derive(PartialEq, Eq)]
pub enum mpl_result_t { MPL_OK = 0, /* ... */ }

#[repr(C)]
#[derive(Clone, Copy)]
pub struct mpl_host_api_t {
    pub log: unsafe extern "C" fn(*mut c_void, mpl_log_level_t, *const c_char),
    pub get_config: unsafe extern "C" fn(*mut c_void, *const c_char, *mut c_char, *mut u32) -> mpl_result_t,
    pub set_config: unsafe extern "C" fn(*mut c_void, *const c_char, *const c_char) -> mpl_result_t,
    pub emit_event: unsafe extern "C" fn(*mut c_void, *const c_char, *const c_char) -> mpl_result_t,
    pub send_message: unsafe extern "C" fn(*mut c_void, *const c_char, *const u8, u32) -> mpl_result_t,
    pub audio_state: unsafe extern "C" fn(*mut c_void, *mut c_char, *mut u32) -> mpl_result_t,
    pub connected_devices: unsafe extern "C" fn(*mut c_void, *mut c_char, *mut u32) -> mpl_result_t,
    pub ctx: *mut c_void,
}

static mut HOST: Option<mpl_host_api_t> = None;
static mut GAIN: f64 = 2.0;

// 防止 panic 跨 FFI 边界（UB），统一转运行时错误码
fn guard<F: FnOnce() -> mpl_result_t + std::panic::UnwindSafe>(f: F) -> mpl_result_t {
    std::panic::catch_unwind(f).unwrap_or(mpl_result_t::MPL_ERR_RUNTIME)
}

#[unsafe(no_mangle)]
pub extern "C" fn micyou_plugin_info() -> *const mpl_plugin_info_t {
    static INFO: mpl_plugin_info_t = /* abiVersion=1, apiVersion=1, id=PLUGIN_ID, version=... */;
    &INFO
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn micyou_plugin_init(host: *const mpl_host_api_t) -> mpl_result_t {
    guard(|| {
        if host.is_null() { return mpl_result_t::MPL_ERR_INVALID_ARG; }
        unsafe { HOST = Some(*host); }
        mpl_result_t::MPL_OK
    })
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn micyou_plugin_process(
    data: *mut f32, samples: u32, _channels: u32, _queued_ms: f64, bypass: *mut u32,
) -> mpl_result_t {
    guard(|| {
        let gain = unsafe { GAIN };
        if gain <= 0.0 { unsafe { *bypass = 1 }; return mpl_result_t::MPL_OK; }
        unsafe { for i in 0..samples as usize { *data.add(i) *= gain as f32; } *bypass = 0; }
        mpl_result_t::MPL_OK
    })
}
```

要点：

- 所有跨 FFI 的函数必须 `#[unsafe(no_mangle)] extern "C"`，返回值用 `mpl_result_t`
- panic 必须被捕获（`catch_unwind`），绝不跨 ABI 边界传播
- 字符串通过 NUL 结尾指针传递；host 回调的 `out/out_size` 采用缓冲区契约（详见 [API 参考](plugin-api-reference.md#缓冲区契约)）
- 配置读取：`init` 时通过 `host.get_config("gain")` 获取 JSON 字符串

### 用 C 编写

C 插件直接 `#include "micyou_plugin_abi.h"` 实现符号即可，导出宏已处理各平台（`MPL_EXPORT`）

## 编写 WASM 插件

WASM 插件是 core wasm 模块（无需 WASI），在 `wasmi` 纯 Rust 解释器中沙箱执行

### 导出（宿主期望）

| 导出 | 签名 | 必填 | 说明 |
| --- | --- | --- | --- |
| `memory` | memory | 是 | 线性内存，宿主通过它交换数据 |
| `alloc` | `(i32) -> i32` | 是 | 分配 size 字节，返回地址 |
| `dealloc` | `(i32, i32) -> ()` | 是 | 释放 |
| `api_version` | `() -> i32` | 否 | 返回 1 |
| `init` | `() -> i32` | 否 | 初始化，0=成功 |
| `process` | `(i32,i32,i32,f64) -> i32` | 否 | DSP 处理，0=ok 1=bypass |
| `handle_event` | `(i32) -> i32` | 否 | 事件（JSON 字符串指针） |
| `handle_message` | `(i32,i32) -> i32` | 否 | 跨端消息（指针, 长度） |
| `deinit` | `() -> ()` | 否 | 反初始化 |

### 导入（宿主提供，模块名 `micyou`）

| 导入 | 签名 | 说明 |
| --- | --- | --- |
| `log` | `(i32, i32) -> ()` | level(0-4), NUL 字符串指针 |
| `get_config` | `(i32) -> i32` | key 指针 -> 宿主分配 JSON 指针（0 = 无） |
| `set_config` | `(i32, i32) -> i32` | key, value JSON 指针 -> 结果码 |
| `emit_event` | `(i32, i32) -> i32` | topic, payload JSON 指针 -> 结果码 |
| `send_message` | `(i32, i32, i32) -> i32` | target JSON, 数据指针, 长度 -> 结果码 |
| `audio_state` | `() -> i32` | -> 宿主分配 JSON 指针 |
| `connected_devices` | `() -> i32` | -> 宿主分配 JSON 数组指针 |
| `play_sound` | `(i32) -> i32` | WAV 路径指针 -> 结果码（需 audio.play） |
| `plugin_dir` | `() -> i32` | -> 插件安装目录绝对路径字符串 |
| `register_hotkey` | `(i32) -> i64` | 快捷键字符串指针 -> 句柄 id（0 = 失败） |

### 完整最小示例（WAT）

`plugins/examples/wasm-counter/counter.wat` 是完整示例，构建用 `wat2wasm counter.wat -o counter.wasm`（见 `build.sh`）

核心骨架：

```wat
(module
  (import "micyou" "log" (func $log (param i32 i32)))
  (import "micyou" "emit_event" (func $emit_event (param i32 i32) (result i32)))

  (memory (export "memory") 1)
  (data (i32.const 0) "hello from wasm\00")

  ;; bump 分配器
  (global $bump (mut i32) (i32.const 1024))
  (func (export "alloc") (param $size i32) (result i32)
    (local $ptr i32)
    (local.set $ptr (global.get $bump))
    (global.set $bump (i32.add (global.get $bump) (i32.and (i32.add (local.get $size) (i32.const 7)) (i32.const -8))))
    (local.get $ptr))
  (func (export "dealloc") (param $ptr i32) (param $size i32))

  (func (export "init") (result i32)
    (call $log (i32.const 2) (i32.const 0))  ;; INFO
    (i32.const 0))
)
```

要点：

- 字符串放数据段，指针即线性内存地址；`alloc` 供宿主写入（如 `get_config` 返回的 JSON）
- 宿主调用任何导出前都会注入燃料预算（默认 100 000），死循环会被 trap 而非挂起宿主
- WASM 插件不得声明 `realtimeSafe`（解释执行无法保证实时性），宿主按 best-effort 处理
- 每个入口调用都是新的燃料预算，宿主函数调用（如 `emit_event`）也受燃料计量

## Host API 使用

插件通过 host 回调访问宿主能力，全部能力需要 manifest 中声明对应 capability，未声明会被拒绝（错误码 `MPL_ERR_PERMISSION` / 8）

| 能力 | 对应 API | 说明 |
| --- | --- | --- |
| `config.read` / `config.write` | get_config / set_config | 插件私有配置（持久化在 `plugin-state.json`） |
| `event.emit` | emit_event | 向总线发布事件（本地订阅者 + 已连接的远端） |
| `message.send` | send_message | 向本地/远端插件发消息 |
| `audio.state` | audio_state | 实时音频流快照 |
| `audio.play` | play_sound | 播放 WAV 音效（异步，非实时） |
| `device.list` | connected_devices | 已连接设备 |
| `dsp.node` | （manifest 声明） | 注册为 DSP 链节点 |
| `plugin_dir` | 无需能力 | 查询插件安装目录（只读） |
| `network.io` | — | 预留：出站网络 |
| `fs.read` | — | 预留：插件沙箱内文件读取 |

## 实时 DSP 插件规范

实时安全是硬性要求（违反可能导致爆音或卡顿）

- 不得在 `process` 中分配堆内存（`Vec`、`String`、格式化等）
- 不得调用阻塞 host API（`get_config` 每次调用涉及锁与 I/O，仅限 `init` 中使用）
- 单帧处理时间必须远小于帧时长（48 kHz 下 480 样本 ≈ 10 ms），建议 < 1 ms
- 状态（滤波器系数、历史缓冲）在插件内预先分配
- 宿主在加载时按 `dsp.realtimeSafe` 信任 Native 插件；WASM DSP 永远视为 best-effort
- 出错返回错误码并保持输出可预测（静音或旁路），绝不 panic 或返回未初始化数据

## 跨端通信 API

手机与电脑连接后（Wi-Fi / USB / Web），两端插件可通过总线通信

### 发消息（插件视角）

```c
// Native：目标为 JSON 对象
// {"type":"local","pluginId":"dev.micyou.other"} 或
// {"type":"remote","pluginId":"dev.micyou.phone.sensor"} 或 {"type":"broadcast"}
host->send_message(host->ctx,
    "{\"type\":\"remote\",\"pluginId\":\"dev.micyou.phone.sensor\"}",
    payload, payload_len);
```

### 收消息（插件视角）

实现 `micyou_plugin_handle_message(source, topic, payload, len)`，宿主会把远端发来的消息路由进来

### RPC（请求-响应）

- 宿主总线用 `correlationId` 配对请求与响应
- 插件间 RPC 需要自行约定主题格式（推荐 `rpc:<method>`），响应通过 `handle_message` 回传
- 宿主代码可用 `PluginBus::request` 发起带超时的同步 RPC（禁止在实时音频线程调用）

### 事件订阅

- 插件可用 `emit_event` 发布事件；本地与远端订阅者都会收到
- 宿主总线内置 `handle_incoming` 路由：响应完成 pending RPC，请求/事件投递给本地分发器与主题订阅者

## 高级示例（直接可跑的参考实现）

`plugins/examples/` 提供两个示例，覆盖核心能力

### 音效板（native-soundpad）：按钮面板 + 专属设置页 + 快捷键 + 音频播放

- `ui.route=buttons` 通用按钮网格：前端读取 `config.sounds` 渲染按钮
- `ui.panels` 专属设置页：`panel.html`（自包含单文件 HTML）在设置对话框侧边栏动态渲染，通过 postMessage 桥调用宿主
- `register_hotkey("ctrl+shift+s")`：全局快捷键，按下后收到 `hotkey:<id>` 消息并播放第一个音效
- `play_sound`：音效混入虚拟麦克风输出流，对方与用户都能听到
- `init` 时自动生成三个正弦波 WAV（写入插件目录 `sounds/`）并持久化配置

```json
{
  "ui": {
    "route": "buttons",
    "label": "Soundpad",
    "panels": [ { "id": "console", "label": "控制台", "entry": "panel.html" } ]
  },
  "capabilities": ["config.read", "config.write", "audio.play"],
  "config": { "sounds": [ { "id": "beep", "label": "Beep", "file": "sounds/beep.wav" } ] }
}
```

### 降噪引擎（native-noisegate）：实时 DSP 处理

- 帧 RMS 噪声门：低于阈值按 depth 衰减，attack/release 包络平滑避免咔哒声
- 全程无分配、无 host 调用（配置经原子变量无锁读取），满足实时安全
- 进 DSP 链的位置由 `dsp.insertAfter` 决定（默认 AEC 之后）

## 编写插件专属设置页（ui.panels）

插件可在设置对话框侧边栏拥有专属页面（渲染在「插件」之后）

1. manifest 声明 `ui.panels`，`entry` 是插件目录内的自包含 HTML 文件
2. 宿主命令 `get_plugin_panel` 返回 HTML，前端用沙箱 iframe（`allow-scripts`，无 same-origin）渲染
3. 面板内联脚本通过 postMessage 桥与宿主通信（见 `usePluginPanelBridge`）：

```js
function call(api, args) {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    const onMsg = (e) => {
      if (e.data && e.data.__micyou === 1 && e.data.id === id) {
        window.removeEventListener('message', onMsg);
        e.data.ok ? resolve(e.data.value) : reject(new Error(e.data.error));
      }
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ __micyou: 1, id, api, args: args || {} }, '*');
  });
}
const cfg = await call('get_config', {});
await call('play', { id: 'beep' });
```

可用桥 API

| api | 参数 | 说明 |
| --- | --- | --- |
| `get_config` | `{}` | 读取插件配置（JSON） |
| `set_config` | `{key, value}` | 写插件配置 |
| `play` | `{id}` | 触发插件播放（`ui:play` 消息） |
| `trigger` | `{action, payload}` | 触发任意插件 UI 动作 |
| `log` | `{level, message}` | 记入插件日志 |
| `get_logs` | `{}` | 读取插件日志 |
| `get_sync_status` | `{}` | 跨端同步状态 |

面板安全：iframe 沙箱隔离，面板脚本只能经 postMessage 与宿主通信，无法访问宿主 DOM

## 使用全局快捷键

- 插件在 `init` 中调用 `register_hotkey("ctrl+shift+s")` 获取句柄
- 按下快捷键 → 宿主经总线投递 `hotkey:<id>` 消息 → 插件 `handle_message` 处理
- 快捷键在插件进程退出时自动注销
- 同一快捷键被多个插件注册时，所有注册插件都会收到

## 调试与测试## 调试与测试

- 插件日志：GUI 插件管理面板「日志」标签；宿主日志 `target: "plugin"` 前缀
- 配置：面板「配置」编辑器直接读写 JSON
- 失败定位：`list_plugins` 返回 `error` 字段（加载失败的详细原因）
- 本地开发：把插件目录放入宿主插件目录，面板点「刷新」即可重扫
- 测试夹具参考：`crates/micyou-plugin/tests/` 下的 native_loader / wasm_loader 集成测试
