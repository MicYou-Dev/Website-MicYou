---
title: 插件开发指南 - MicYou
description: 完整的 MicYou 插件开发教程：快速起步、Manifest 规范、Native 与 WASM 插件编写、Host API 及跨端通信。
keywords: MicYou,插件开发,WASM,Native,manifest,示例插件,Host API
---

# 插件开发指南

本文档为开发者提供开发 MicYou 插件的完整指引，涵盖 Native 与 WebAssembly (WASM) 插件编写、清单规范、Host API 调用及实时音频安全要求。

## 1. 快速起步

MicYou 提供了便捷的 CLI 命令来快速初始化、校验和打包插件：

```bash
# 创建 WASM 插件工程（默认）
micyou plugin create dev.micyou.myplugin

# 创建 Native 插件工程
micyou plugin create dev.micyou.mynative --runtime native

# 校验 plugin.json 清单与二进制产物
micyou plugin validate ./myplugin

# 打包为可分发与导入的 ZIP 压缩包
micyou plugin package ./myplugin -o myplugin.zip
```

### 插件目录结构

```text
<插件目录>/
├── plugin.json          # 插件清单文件（必需）
├── <entry>              # 入口产物：Native 为 .so/.dylib/.dll，WASM 为 .wasm
└── panel.html           # 专属设置面板页面（可选）
```

本地开发时，直接将插件目录复制到宿主的插件目录中即可，刷新设置页面会自动重新扫描：
- **Windows**：`%APPDATA%\micyou\plugins\`
- **macOS / Linux**：`~/.config/micyou/plugins/`

## 2. 清单文件（plugin.json）规范

`plugin.json` 是插件的身份描述与能力申请清单。

### 字段参考

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名格式，仅限小写字母、数字、点与中划线，如 `dev.micyou.gain` |
| `name` | string | 是 | 插件显示名称 |
| `version` | string | 是 | 遵循 SemVer 语义化版本号，如 `1.0.0` |
| `runtime` | string | 是 | 运行环境：`native` 或 `wasm` |
| `entry` | string | 是 | 入口产物文件名（相对于插件根目录） |
| `author` | string | 否 | 作者名称或联系邮箱 |
| `description` | string | 否 | 插件功能简述 |
| `license` | string | 否 | 开源或私有许可证标识（如 `MIT`、`GPL-3.0-only`） |
| `apiVersion` | number | 否 | 所需 Host API 版本（当前为 `1`） |
| `capabilities` | string[] | 否 | 申请的能力权限列表（如 `dsp.node`、`config.read`） |
| `kind` | string | 否 | 插件类型：`dsp`、`utility`、`ui`、`bridge`（默认为 `utility`） |
| `dsp` | object | 否 | DSP 节点属性配置（`insertAfter`、`first`、`realtimeSafe`） |
| `ui` | object | 否 | UI 面板注册配置（`route`、`label`、`panels`） |
| `config` | object | 否 | 默认配置项（初次安装时写入） |
| `configSchema` | object | 否 | 声明式表单 Schema，宿主自动渲染设置表单 |
| `dependencies` | object[] | 否 | 前置依赖插件列表 `[{ id, version, optional }]` |
| `updateUrl` | string | 否 | 远端清单 URL，用于应用内检查更新 |

### 声明式配置表单（configSchema）

声明 `configSchema` 后，无需手写前端页面，宿主会在插件卡片上自动渲染原生风格表单：

```json
"configSchema": {
  "fields": [
    { "key": "gain", "fieldType": "number", "label": "增益倍数", "min": 0.5, "max": 5.0, "step": 0.1, "default": 2.0 },
    { "key": "enabled", "fieldType": "boolean", "label": "启用效果", "default": true },
    { "key": "mode", "fieldType": "select", "label": "模式", "options": [{ "value": "fast", "label": "低延迟" }] }
  ]
}
```

## 3. 编写 Native 插件

Native 插件编译为平台的动态链接库（cdylib），通过 C ABI 与宿主交互。

### 必需导出的 C 符号

```c
// 返回插件元数据（包含 ABI 版本、API 版本与插件 ID）
const mpl_plugin_info_t *micyou_plugin_info(void);

// 初始化：保存 Host API 函数表指针并读取配置
mpl_result_t micyou_plugin_init(const mpl_host_api_t *host);

// 反初始化：释放资源（宿主卸载动态库前调用）
void micyou_plugin_deinit(void);
```

### 可选导出的 C 符号

```c
// 实时音频 DSP 处理：原地处理交错 f32 样本，bypass=1 表示本帧旁路
mpl_result_t micyou_plugin_process(float *data, uint32_t samples, uint32_t channels, double queued_ms, uint32_t *bypass);

// 本地事件监听
mpl_result_t micyou_plugin_handle_event(const char *type, const char *json);

// 跨端消息接收
mpl_result_t micyou_plugin_handle_message(const char *source, const char *topic, const uint8_t *payload, uint32_t payload_len);
```

### Rust 最小实现示例

```rust
use std::ffi::{c_char, c_void};

const PLUGIN_ID: &[u8] = b"dev.micyou.example.gain\0";

#[repr(C)]
pub struct mpl_plugin_info_t {
    pub abi_version: u32,
    pub api_version: u32,
    pub id: *const c_char,
    pub version: *const c_char,
    pub name: *const c_char,
}

static mut GAIN: f32 = 2.0;

#[no_mangle]
pub extern "C" fn micyou_plugin_info() -> *const mpl_plugin_info_t {
    static INFO: mpl_plugin_info_t = mpl_plugin_info_t {
        abi_version: 1,
        api_version: 1,
        id: PLUGIN_ID.as_ptr() as *const c_char,
        version: b"1.0.0\0".as_ptr() as *const c_char,
        name: b"Example Gain\0".as_ptr() as *const c_char,
    };
    &INFO
}

#[no_mangle]
pub unsafe extern "C" fn micyou_plugin_init(_host: *const c_void) -> i32 {
    0 // 0 = MPL_OK
}

#[no_mangle]
pub unsafe extern "C" fn micyou_plugin_process(
    data: *mut f32,
    samples: u32,
    _channels: u32,
    _queued_ms: f64,
    bypass: *mut u32,
) -> i32 {
    let gain = GAIN;
    if gain <= 0.0 {
        *bypass = 1;
        return 0;
    }
    for i in 0..samples as usize {
        *data.add(i) *= gain;
    }
    *bypass = 0;
    0
}

#[no_mangle]
pub extern "C" fn micyou_plugin_deinit() {}
```

## 4. 编写 WebAssembly (WASM) 插件

WASM 插件在 `wasmi` 纯 Rust 解释器沙箱中执行，天然安全且一次编译全平台通用。

### 宿主期望的 WASM 导出函数

- `memory`：线性内存。
- `alloc(size: i32) -> i32`：在 WASM 内存中分配缓冲区供宿主写入数据。
- `dealloc(ptr: i32, size: i32)`：释放内存。
- `init() -> i32`：初始化入口（返回 0 代表成功）。
- `process(data_ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32`（可选）：音频处理。
- `handle_event(json_ptr: i32) -> i32`（可选）：事件回调。
- `handle_message(payload_ptr: i32, len: i32) -> i32`（可选）：跨端消息回调。
- `deinit()`（可选）：清理。

### 宿主向 WASM 提供的导入函数（模块名 `micyou`）

- `log(level, msg_ptr)`：输出日志。
- `get_config(key_ptr) -> json_ptr`：读取插件配置。
- `set_config(key_ptr, value_ptr) -> code`：持久化插件配置。
- `emit_event(topic_ptr, payload_ptr) -> code`：发布总线事件。
- `send_message(target_ptr, payload_ptr, len) -> code`：发送跨端或插件间消息。
- `play_sound(path_ptr) -> code`：混音播放指定音频文件。
- `register_hotkey(shortcut_ptr) -> hotkey_id`：注册系统全局快捷键。

## 5. 实时音频 DSP 安全规范

为了避免音频爆音、杂音或欠载，编写 DSP 插件时必须遵守以下实时音频安全约束：

- **禁止在 `process` 中分配堆内存**：不要在实时音频循环中调用 `malloc`、创建 `String` 或动态扩容数组。
- **禁止调用阻塞式 I/O 与锁**：文件读写、网络请求及涉及锁争用的 Host API 严禁在 `process` 中调用。
- **严格控制耗时**：48 kHz 下每帧（480 样本）时长约为 10ms，单个插件的处理耗时应严格控制在 1ms 以内。
- **状态预分配**：滤波器系数、延迟环形缓冲区等状态需在 `init` 阶段预先分配完成。

## 6. 插件专属设置面板（ui.panels）

插件可在设置对话框侧边栏生成专属配置页面：

1. 在 `plugin.json` 中配置 `ui.panels`，指定自包含的 HTML 入口文件（如 `panel.html`）。
2. 前端通过沙箱 iframe 隔离加载该页面。
3. 页面内使用标准 `window.postMessage` 桥与宿主安全通信：

```javascript
// 向宿主发起调用
async function callHost(api, args) {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    const handler = (e) => {
      if (e.data && e.data.__micyou === 1 && e.data.id === id) {
        window.removeEventListener('message', handler);
        e.data.ok ? resolve(e.data.value) : reject(new Error(e.data.error));
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ __micyou: 1, id, api, args: args || {} }, '*');
  });
}

// 示例：获取当前配置并播放音效
const config = await callHost('get_config', {});
await callHost('play', { id: 'beep' });
```

## 7. 测试与调试

- **实时日志**：在 MicYou 桌面端「设置」>「插件」中点击插件卡片上的「日志」，可实时查看控制台输出。
- **配置调试**：在插件卡片上点击「配置」，可实时查看和手动修改持久化的 JSON 状态。
- **加载排错**：若插件无法加载，在管理界面中可直接查看具体的失败原因与错误码。
