---
title: 插件開發指南 - MicYou
description: 完整的 MicYou 插件開發教學：快速起步、Manifest 規範、Native 與 WASM 插件撰寫、Host API 及跨端通訊。
keywords: MicYou,插件開發,WASM,Native,manifest,範例插件,Host API
---

# 插件開發指南

本文件為開發者提供開發 MicYou 插件的完整指引，涵蓋 Native 與 WebAssembly (WASM) 插件撰寫、清單規範、Host API 呼叫及即時音訊安全要求。

## 1. 快速起步

MicYou 提供了便捷的 CLI 命令來快速初始化、校驗和打包插件：

```bash
# 建立 WASM 插件專案（預設）
micyou plugin create dev.micyou.myplugin

# 建立 Native 插件專案
micyou plugin create dev.micyou.mynative --runtime native

# 校驗 plugin.json 清單與二進位產物
micyou plugin validate ./myplugin

# 打包為可分發與匯入的 ZIP 壓縮檔
micyou plugin package ./myplugin -o myplugin.zip
```

### 插件目錄結構

```text
<插件目錄>/
├── plugin.json          # 插件清單檔案（必需）
├── <entry>              # 進入點產物：Native 為 .so/.dylib/.dll，WASM 為 .wasm
└── panel.html           # 專屬設定面板頁面（選填）
```

本地開發時，直接將插件目錄複製到宿主的插件目錄中即可，重新整理設定頁面會自動重新掃描：
- **Windows**：`%APPDATA%\micyou\plugins\`
- **macOS / Linux**：`~/.config/micyou/plugins/`

## 2. 清單檔案（plugin.json）規範

`plugin.json` 是插件的身分描述與能力申請清單。

### 欄位參考

| 欄位 | 類型 | 必填 | 說明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名格式，僅限小寫英文字母、數字、點與連字號，如 `dev.micyou.gain` |
| `name` | string | 是 | 插件顯示名稱 |
| `version` | string | 是 | 遵循 SemVer 語意化版本號，如 `1.0.0` |
| `runtime` | string | 是 | 執行環境：`native` 或 `wasm` |
| `entry` | string | 是 | 進入點產物檔案名稱（相對於插件根目錄） |
| `author` | string | 否 | 作者名稱或聯絡信箱 |
| `description` | string | 否 | 插件功能簡述 |
| `license` | string | 否 | 開源或私有授權條款標識（如 `MIT`、`GPL-3.0-only`） |
| `apiVersion` | number | 否 | 所需 Host API 版本（目前為 `1`） |
| `capabilities` | string[] | 否 | 申請的能力權限清單（如 `dsp.node`、`config.read`） |
| `kind` | string | 否 | 插件類型：`dsp`、`utility`、`ui`、`bridge`（預設為 `utility`） |
| `dsp` | object | 否 | DSP 節點屬性設定（`insertAfter`、`first`、`realtimeSafe`） |
| `ui` | object | 否 | UI 面板註冊設定（`route`、`label`、`panels`） |
| `config` | object | 否 | 預設設定項目（初次安裝時寫入） |
| `configSchema` | object | 否 | 宣告式表單 Schema，宿主自動渲染設定表單 |
| `dependencies` | object[] | 否 | 前置依賴插件清單 `[{ id, version, optional }]` |
| `updateUrl` | string | 否 | 遠端清單 URL，用於應用程式內檢查更新 |

### 宣告式設定表單（configSchema）

宣告 `configSchema` 後，無需手寫前端頁面，宿主會在插件資訊卡上自動渲染原生風格表單：

```json
"configSchema": {
  "fields": [
    { "key": "gain", "fieldType": "number", "label": "增益倍數", "min": 0.5, "max": 5.0, "step": 0.1, "default": 2.0 },
    { "key": "enabled", "fieldType": "boolean", "label": "啟用效果", "default": true },
    { "key": "mode", "fieldType": "select", "label": "模式", "options": [{ "value": "fast", "label": "低延遲" }] }
  ]
}
```

## 3. 撰寫 Native 插件

Native 插件編譯為平台的動態連結程式庫（cdylib），透過 C ABI 與宿主互動。

### 必需導出的 C 符號

```c
// 回傳插件元資料（包含 ABI 版本、API 版本與插件 ID）
const mpl_plugin_info_t *micyou_plugin_info(void);

// 初始化：保存 Host API 函式表指標並讀取設定
mpl_result_t micyou_plugin_init(const mpl_host_api_t *host);

// 反初始化：釋放資源（宿主卸載動態程式庫前呼叫）
void micyou_plugin_deinit(void);
```

### 選填導出的 C 符號

```c
// 即時音訊 DSP 處理：原地處理交錯 f32 樣本，bypass=1 表示本幀旁路
mpl_result_t micyou_plugin_process(float *data, uint32_t samples, uint32_t channels, double queued_ms, uint32_t *bypass);

// 本地事件監聽
mpl_result_t micyou_plugin_handle_event(const char *type, const char *json);

// 跨端訊息接收
mpl_result_t micyou_plugin_handle_message(const char *source, const char *topic, const uint8_t *payload, uint32_t payload_len);
```

### Rust 最小實作範例

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

## 4. 撰寫 WebAssembly (WASM) 插件

WASM 插件在 `wasmi` 純 Rust 直譯器沙箱中執行，天然安全且一次編譯全平台通用。

### 宿主期望的 WASM 導出函式

- `memory`：線性記憶體。
- `alloc(size: i32) -> i32`：在 WASM 記憶體中配置緩衝區供宿主寫入資料。
- `dealloc(ptr: i32, size: i32)`：釋放記憶體。
- `init() -> i32`：初始化進入點（回傳 0 代表成功）。
- `process(data_ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32`（選填）：音訊處理。
- `handle_event(json_ptr: i32) -> i32`（選填）：事件回呼。
- `handle_message(payload_ptr: i32, len: i32) -> i32`（選填）：跨端訊息回呼。
- `deinit()`（選填）：清理。

### 宿主向 WASM 提供的匯入函式（模組名稱 `micyou`）

- `log(level, msg_ptr)`：輸出日誌。
- `get_config(key_ptr) -> json_ptr`：讀取插件設定。
- `set_config(key_ptr, value_ptr) -> code`：持久化插件設定。
- `emit_event(topic_ptr, payload_ptr) -> code`：發布匯流排事件。
- `send_message(target_ptr, payload_ptr, len) -> code`：發送跨端或插件間訊息。
- `play_sound(path_ptr) -> code`：混音播放指定音訊檔案。
- `register_hotkey(shortcut_ptr) -> hotkey_id`：註冊系統全域快捷鍵。

## 5. 即時音訊 DSP 安全規範

為了避免音訊爆音、雜音或掉幀，撰寫 DSP 插件時必須遵守以下即時音訊安全約束：

- **禁止在 `process` 中配置堆積記憶體**：不要在即時音訊循環中呼叫 `malloc`、建立 `String` 或動態擴容陣列。
- **禁止呼叫阻塞式 I/O 與鎖**：檔案讀寫、網路請求及涉及鎖競爭的 Host API 嚴禁在 `process` 中呼叫。
- **嚴格控制耗時**：48 kHz 下每幀（480 樣本）時長約為 10ms，單個插件的處理耗時應嚴格控制在 1ms 以內。
- **狀態預先配置**：濾波器係數、延遲環形緩衝區等狀態需在 `init` 階段預先配置完成。

## 6. 插件專屬設定面板（ui.panels）

插件可在設定對話方塊側邊欄產生專屬設定頁面：

1. 在 `plugin.json` 中設定 `ui.panels`，指定自包含的 HTML 進入點檔案（如 `panel.html`）。
2. 前端透過沙箱 iframe 隔離載入該頁面。
3. 頁面內使用標準 `window.postMessage` 橋與宿主安全通訊：

```javascript
// 向宿主發起呼叫
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

// 範例：取得目前設定並播放音效
const config = await callHost('get_config', {});
await callHost('play', { id: 'beep' });
```

## 7. 測試與除錯

- **即時記錄**：在 MicYou 桌面端「設定」>「插件」中點擊插件資訊卡上的「日誌」，可即時檢視控制台輸出。
- **設定除錯**：在插件資訊卡上點擊「設定」，可即時檢視和手動修改持久化的 JSON 狀態。
- **載入除錯**：若插件無法載入，在管理介面中可直接檢視具體的失敗原因與錯誤代碼。
