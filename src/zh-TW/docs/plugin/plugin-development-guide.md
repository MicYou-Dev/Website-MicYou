---
title: MicYou 插件開發指南
description: 插件系統開發快速入門：雙運行時、manifest、示例插件與開發工具
keywords: MicYou,插件開發,WASM,native,manifest,示例插件
---


面向插件作者的完整指南：Native 與 WASM 插件如何編寫、Manifest 怎麼寫、Host API 怎麼用、實時安全要求與跨端通信方法

## 目錄

1. [目錄結構](#目錄結構)
2. [Manifest（plugin.json）](#manifestpluginjson)
3. [編寫 Native 插件](#編寫-native-插件)
4. [編寫 WASM 插件](#編寫-wasm-插件)
5. [Host API 使用](#host-api-使用)
6. [實時 DSP 插件規範](#實時-dsp-插件規範)
7. [跨端通信 API](#跨端通信-api)
8. [調試與測試](#調試與測試)

## 目錄結構

```text
<插件目錄>/
├── plugin.json          # 清單（必需）
├── <entry>              # 入口產物：libxxx.so / xxx.wasm（與清單 entry 一致）
└── assets/              # 可選私有資源
```

插件目錄放在宿主的插件目錄下，每個插件一個子目錄，目錄名建議與插件 id 一致：

- Linux: `~/.config/micyou/plugins/`
- Windows: `%APPDATA%\micyou\plugins\`
- macOS: `~/.config/micyou/plugins/`

## Manifest（plugin.json）

| 字段 | 類型 | 必填 | 說明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名，如 `dev.micyou.example.gain`，小寫字母數字 + `.` `-`，必須含點 |
| `name` | string | 是 | 顯示名 |
| `version` | string | 是 | SemVer |
| `author` | string | 否 | 作者 |
| `description` | string | 否 | 描述 |
| `runtime` | string | 是 | `native` 或 `wasm` |
| `entry` | string | 是 | 入口文件名（相對插件目錄） |
| `platforms` | string[] | 否 | `linux` / `windows` / `macos` / `android`，空 = 全部 |
| `apiVersion` | number | 否 | Host API 版本，默認 1；與宿主不一致拒絕加載 |
| `capabilities` | string[] | 否 | 申請的能力，見 [API 參考](plugin-api-reference.md#權限清單) |
| `kind` | string | 否 | `dsp` / `utility` / `ui` / `bridge`，默認 `utility` |
| `ui` | object | 否 | UI 面板註冊（kind 為 `ui` 時必填）：`{ route, label, entry? }` |
| `dsp` | object | 否 | DSP 節點註冊（kind 為 `dsp`）：`{ insertAfter?, first?, frameSize?, realtimeSafe }` |
| `config` | object | 否 | 默認配置（首次啟用時合併進插件配置） |

示例（Native DSP 插件）：

```json
{
  "id": "dev.micyou.example.gain",
  "name": "Example Native Gain",
  "version": "1.0.0",
  "author": "MicYou",
  "description": "可配置增益的 DSP 節點",
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

校驗規則（不滿足即拒絕加載並給出原因）：

- id 必須合法反向域名格式
- version 必須合法 SemVer
- `apiVersion` 必須等於宿主 Host API 版本（當前 1）
- capabilities 必須是已知能力（未知能力拒絕）
- WASM DSP 插件不得聲明 `realtimeSafe: true`
- `ui` 類型插件必須聲明 `ui` 描述

### 配置表單自動生成（configSchema）

```json
"configSchema": {
  "fields": [
    { "key": "workMin", "fieldType": "number", "label": "工作時長", "min": 1, "max": 120, "step": 1, "default": 25 },
    { "key": "enabled", "fieldType": "boolean", "label": "啟用", "default": true },
    { "key": "mode", "fieldType": "select", "options": [{ "value": "a", "label": "A" }] }
  ]
}
```

- 插件聲明 schema 後無需手寫設置頁，宿主在插件卡片渲染原生風格表單
- 支持 number（滑桿）/ boolean（開關）/ string（輸入）/ select（下拉）
- 保存走 set_plugin_config，配置熱更新鏈路自動生效

### 插件依賴（dependencies）

```json
"dependencies": [
  { "id": "dev.micyou.effect", "version": "^1.0.0", "optional": false }
]
```

- 啟用前宿主校驗：依賴須已安裝、已啟用、版本滿足 semver 約束
- optional=true 時缺失僅警告不阻塞；插件間調用複用 send_message 路由

### 更新機制（updateUrl）

- 聲明 `updateUrl` 指向遠端 manifest JSON，應用內「檢查更新」做 semver 對比
- 有新版時一鍵更新：下載 zip → 替換安裝目錄 → 按原狀態重新啟用

### 運行時選擇：WASM 優先

- **WASM（默認推薦）**：沙箱隔離、內存與燃料受限、跨平臺（同一 .wasm 在
  Windows/macOS/Linux/未來 Android 通用）、能力由宿主授權
  - 適用：邏輯、UI 面板、自動化、定時任務、HTTP、文件（插件沙箱內）、配置
  - 性能：wasmi 解釋器 100-500 Mops/s，48kHz 音頻幀處理實測 ~70µs/幀（預算 10ms）
- **Native（cdylib）**：宿主完整權限，用於實時 DSP 與深度系統集成
  - 適用：自研降噪/變聲算法、ONNX 推理、硬件交互
  - 要求：按平臺分別編譯（.so / .dylib / .dll），須聲明 `arches`
  - 注意：process() 內禁止調用宿主 API（實時安全）

### 開發工具（micyou plugin）

```bash
micyou plugin create dev.micyou.myplugin          # 生成 wasm 骨架（默認）
micyou plugin create dev.micyou.mynative --runtime native
micyou plugin validate ./myplugin                 # 校驗 plugin.json 與入口產物
micyou plugin package ./myplugin -o out.zip       # 打包為可導入 zip
```

- `create` 生成 plugin.json + 入口模板 + panel.html + README
- wasm 骨架：編譯 main.wat → main.wasm 後放入目錄即完成構建
- native 骨架：cargo build --release 後複製產物並按 entry 命名
- `package` 自動跳過 target/ 與隱藏文件，產物根目錄含 plugin.json，應用內可直接導入

### 字段完整參考

| 字段 | 類型 | 必填 | 說明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | 反向域名（如 dev.micyou.eq），小寫字母數字與點連字符，須含點 |
| `name` | string | ✅ | 顯示名 |
| `version` | string | ✅ | semver |
| `author` | string | | 作者（郵箱或暱稱） |
| `description` | string | | 簡述 |
| `license` | string | | SPDX 許可標識（如 MIT、GPL-3.0-only） |
| `homepage` | string | | 項目主頁 |
| `repository` | string | | 源碼倉庫 |
| `keywords` | string[] | | 搜索關鍵詞 |
| `runtime` | string | ✅ | `wasm` \| `native` |
| `entry` | string | ✅ | 入口產物文件名（相對插件目錄） |
| `platforms` | string[] | | 支持系統，空 = 全部（linux / windows / macos / android） |
| `arches` | string[] | | **native 插件支持的 CPU 架構**（x86_64 / aarch64 / i686 / armv7 / riscv64），空 = 全部 |
| `apiVersion` | number | ✅ | 宿主 API 版本（當前 1） |
| `minHostVersion` | string | | 最低宿主 API 版本（semver，major 超過宿主即拒絕） |
| `capabilities` | string[] | | 請求的能力（見 API 參考權限清單） |
| `kind` | string | | `dsp` \| `utility` \| `ui` \| `bridge`，默認 utility |
| `ui` | object | | ui 描述（route / label / panels） |
| `dsp` | object | | dsp 描述（insertAfter / first / frameSize / realtimeSafe） |
| `config` | object | | 默認配置（首次啟用時合入狀態） |
| `icon` | string | | 圖標文件名（PNG，相對插件目錄） |
| `nameI18n` | object | | 本地化名稱（BCP-47 標籤 → 名稱） |
| `descriptionI18n` | object | | 本地化描述（BCP-47 標籤 → 描述） |
| `dependencies` | object[] | | 前置插件依賴 [{id, version, optional}]，啟用前校驗 |
| `configSchema` | object | | 聲明式配置 schema，宿主自動生成設置表單 |
| `updateUrl` | string | | 遠端 manifest JSON（更新檢查與一鍵更新） |

示例（帶新字段）：

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

## 編寫 Native 插件

Native 插件是平臺 cdylib，通過版本化 C ABI 與宿主交互，ABI 定義在
`micyou_plugin_abi.h`

### 必需符號

```c
// 靜態插件身份（abiVersion 必須等於 1，apiVersion 必須等於 1，id 必須與 manifest 一致）
const mpl_plugin_info_t *micyou_plugin_info(void);

// 初始化：保存 host 回調錶（生命週期內有效）
mpl_result_t micyou_plugin_init(const mpl_host_api_t *host);

// 反初始化（庫卸載前調用一次）
void micyou_plugin_deinit(void);
```

### 可選符號（缺省視為旁路 / 無操作）

```c
// 實時 DSP：原地處理 samples 個交錯 f32，bypass=1 表示本幀旁路
mpl_result_t micyou_plugin_process(float *data, uint32_t samples, uint32_t channels, double queued_ms, uint32_t *bypass);

// 本地事件通知（type 為事件類型，json 為負載）
mpl_result_t micyou_plugin_handle_event(const char *type, const char *json);

// 跨端消息（source 來源插件 id，topic 主題，payload 二進制負載）
mpl_result_t micyou_plugin_handle_message(const char *source, const char *topic, const uint8_t *payload, uint32_t payload_len);
```

### 完整最小示例（Rust）

`plugins/examples/native-gain/` 是完整可構建示例（`cargo build --release`），核心骨架：

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

// 防止 panic 跨 FFI 邊界（UB），統一轉運行時錯誤碼
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

要點：

- 所有跨 FFI 的函數必須 `#[unsafe(no_mangle)] extern "C"`，返回值用 `mpl_result_t`
- panic 必須被捕獲（`catch_unwind`），絕不跨 ABI 邊界傳播
- 字符串通過 NUL 結尾指針傳遞；host 回調的 `out/out_size` 採用緩衝區契約（詳見 [API 參考](plugin-api-reference.md#緩衝區契約)）
- 配置讀取：`init` 時通過 `host.get_config("gain")` 獲取 JSON 字符串

### 用 C 編寫

C 插件直接 `#include "micyou_plugin_abi.h"` 實現符號即可，導出宏已處理各平臺（`MPL_EXPORT`）

## 編寫 WASM 插件

WASM 插件是 core wasm 模塊（無需 WASI），在 `wasmi` 純 Rust 解釋器中沙箱執行

### 導出（宿主期望）

| 導出 | 簽名 | 必填 | 說明 |
| --- | --- | --- | --- |
| `memory` | memory | 是 | 線性內存，宿主通過它交換數據 |
| `alloc` | `(i32) -> i32` | 是 | 分配 size 字節，返回地址 |
| `dealloc` | `(i32, i32) -> ()` | 是 | 釋放 |
| `api_version` | `() -> i32` | 否 | 返回 1 |
| `init` | `() -> i32` | 否 | 初始化，0=成功 |
| `process` | `(i32,i32,i32,f64) -> i32` | 否 | DSP 處理，0=ok 1=bypass |
| `handle_event` | `(i32) -> i32` | 否 | 事件（JSON 字符串指針） |
| `handle_message` | `(i32,i32) -> i32` | 否 | 跨端消息（指針, 長度） |
| `deinit` | `() -> ()` | 否 | 反初始化 |

### 導入（宿主提供，模塊名 `micyou`）

| 導入 | 簽名 | 說明 |
| --- | --- | --- |
| `log` | `(i32, i32) -> ()` | level(0-4), NUL 字符串指針 |
| `get_config` | `(i32) -> i32` | key 指針 -> 宿主分配 JSON 指針（0 = 無） |
| `set_config` | `(i32, i32) -> i32` | key, value JSON 指針 -> 結果碼 |
| `emit_event` | `(i32, i32) -> i32` | topic, payload JSON 指針 -> 結果碼 |
| `send_message` | `(i32, i32, i32) -> i32` | target JSON, 數據指針, 長度 -> 結果碼 |
| `audio_state` | `() -> i32` | -> 宿主分配 JSON 指針 |
| `connected_devices` | `() -> i32` | -> 宿主分配 JSON 數組指針 |
| `play_sound` | `(i32) -> i32` | WAV 路徑指針 -> 結果碼（需 audio.play） |
| `plugin_dir` | `() -> i32` | -> 插件安裝目錄絕對路徑字符串 |
| `register_hotkey` | `(i32) -> i64` | 快捷鍵字符串指針 -> 句柄 id（0 = 失敗） |

### 完整最小示例（WAT）

`plugins/examples/wasm-counter/counter.wat` 是完整示例，構建用 `wat2wasm counter.wat -o counter.wasm`（見 `build.sh`）

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

要點：

- 字符串放數據段，指針即線性內存地址；`alloc` 供宿主寫入（如 `get_config` 返回的 JSON）
- 宿主調用任何導出前都會注入燃料預算（默認 100 000），死循環會被 trap 而非掛起宿主
- WASM 插件不得聲明 `realtimeSafe`（解釋執行無法保證實時性），宿主按 best-effort 處理
- 每個入口調用都是新的燃料預算，宿主函數調用（如 `emit_event`）也受燃料計量

## Host API 使用

插件通過 host 回調訪問宿主能力，全部能力需要 manifest 中聲明對應 capability，未聲明會被拒絕（錯誤碼 `MPL_ERR_PERMISSION` / 8）

| 能力 | 對應 API | 說明 |
| --- | --- | --- |
| `config.read` / `config.write` | get_config / set_config | 插件私有配置（持久化在 `plugin-state.json`） |
| `event.emit` | emit_event | 向總線發佈事件（本地訂閱者 + 已連接的遠端） |
| `message.send` | send_message | 向本地/遠端插件發消息 |
| `audio.state` | audio_state | 實時音頻流快照 |
| `audio.play` | play_sound | 播放 WAV 音效（異步，非實時） |
| `device.list` | connected_devices | 已連接設備 |
| `dsp.node` | （manifest 聲明） | 註冊為 DSP 鏈節點 |
| `plugin_dir` | 無需能力 | 查詢插件安裝目錄（只讀） |
| `network.io` | — | 預留：出站網絡 |
| `fs.read` | — | 預留：插件沙箱內文件讀取 |

## 實時 DSP 插件規範

實時安全是硬性要求（違反可能導致爆音或卡頓）

- 不得在 `process` 中分配堆內存（`Vec`、`String`、格式化等）
- 不得調用阻塞 host API（`get_config` 每次調用涉及鎖與 I/O，僅限 `init` 中使用）
- 單幀處理時間必須遠小於幀時長（48 kHz 下 480 樣本 ≈ 10 ms），建議 < 1 ms
- 狀態（濾波器係數、歷史緩衝）在插件內預先分配
- 宿主在加載時按 `dsp.realtimeSafe` 信任 Native 插件；WASM DSP 永遠視為 best-effort
- 出錯返回錯誤碼並保持輸出可預測（靜音或旁路），絕不 panic 或返回未初始化數據

## 跨端通信 API

手機與電腦連接後（Wi-Fi / USB / Web），兩端插件可通過總線通信

### 發消息（插件視角）

```c
// Native：目標為 JSON 對象
// {"type":"local","pluginId":"dev.micyou.other"} 或
// {"type":"remote","pluginId":"dev.micyou.phone.sensor"} 或 {"type":"broadcast"}
host->send_message(host->ctx,
    "{\"type\":\"remote\",\"pluginId\":\"dev.micyou.phone.sensor\"}",
    payload, payload_len);
```

### 收消息（插件視角）

實現 `micyou_plugin_handle_message(source, topic, payload, len)`，宿主會把遠端發來的消息路由進來

### RPC（請求-響應）

- 宿主總線用 `correlationId` 配對請求與響應
- 插件間 RPC 需要自行約定主題格式（推薦 `rpc:<method>`），響應通過 `handle_message` 回傳
- 宿主代碼可用 `PluginBus::request` 發起帶超時的同步 RPC（禁止在實時音頻線程調用）

### 事件訂閱

- 插件可用 `emit_event` 發佈事件；本地與遠端訂閱者都會收到
- 宿主總線內置 `handle_incoming` 路由：響應完成 pending RPC，請求/事件投遞給本地分發器與主題訂閱者

## 高級示例（直接可跑的參考實現）

`plugins/examples/` 提供兩個示例，覆蓋核心能力

### 音效板（native-soundpad）：按鈕面板 + 專屬設置頁 + 快捷鍵 + 音頻播放

- `ui.route=buttons` 通用按鈕網格：前端讀取 `config.sounds` 渲染按鈕
- `ui.panels` 專屬設置頁：`panel.html`（自包含單文件 HTML）在設置對話框側邊欄動態渲染，通過 postMessage 橋調用宿主
- `register_hotkey("ctrl+shift+s")`：全局快捷鍵，按下後收到 `hotkey:<id>` 消息並播放第一個音效
- `play_sound`：音效混入虛擬麥克風輸出流，對方與用戶都能聽到
- `init` 時自動生成三個正弦波 WAV（寫入插件目錄 `sounds/`）並持久化配置

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

### 降噪引擎（native-noisegate）：實時 DSP 處理

- 幀 RMS 噪聲門：低於閾值按 depth 衰減，attack/release 包絡平滑避免咔噠聲
- 全程無分配、無 host 調用（配置經原子變量無鎖讀取），滿足實時安全
- 進 DSP 鏈的位置由 `dsp.insertAfter` 決定（默認 AEC 之後）

## 編寫插件專屬設置頁（ui.panels）

插件可在設置對話框側邊欄擁有專屬頁面（渲染在「插件」之後）

1. manifest 聲明 `ui.panels`，`entry` 是插件目錄內的自包含 HTML 文件
2. 宿主命令 `get_plugin_panel` 返回 HTML，前端用沙箱 iframe（`allow-scripts`，無 same-origin）渲染
3. 面板內聯腳本通過 postMessage 橋與宿主通信（見 `usePluginPanelBridge`）：

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

可用橋 API

| api | 參數 | 說明 |
| --- | --- | --- |
| `get_config` | `{}` | 讀取插件配置（JSON） |
| `set_config` | `{key, value}` | 寫插件配置 |
| `play` | `{id}` | 觸發插件播放（`ui:play` 消息） |
| `trigger` | `{action, payload}` | 觸發任意插件 UI 動作 |
| `log` | `{level, message}` | 記入插件日誌 |
| `get_logs` | `{}` | 讀取插件日誌 |
| `get_sync_status` | `{}` | 跨端同步狀態 |

面板安全：iframe 沙箱隔離，面板腳本只能經 postMessage 與宿主通信，無法訪問宿主 DOM

## 使用全局快捷鍵

- 插件在 `init` 中調用 `register_hotkey("ctrl+shift+s")` 獲取句柄
- 按下快捷鍵 → 宿主經總線投遞 `hotkey:<id>` 消息 → 插件 `handle_message` 處理
- 快捷鍵在插件進程退出時自動註銷
- 同一快捷鍵被多個插件註冊時，所有註冊插件都會收到

## 調試與測試## 調試與測試

- 插件日誌：GUI 插件管理面板「日誌」標籤；宿主日誌 `target: "plugin"` 前綴
- 配置：面板「配置」編輯器直接讀寫 JSON
- 失敗定位：`list_plugins` 返回 `error` 字段（加載失敗的詳細原因）
- 本地開發：把插件目錄放入宿主插件目錄，面板點「刷新」即可重掃
- 測試夾具參考：`crates/micyou-plugin/tests/` 下的 native_loader / wasm_loader 集成測試
