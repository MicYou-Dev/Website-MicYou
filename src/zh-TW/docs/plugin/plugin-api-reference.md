---
title: 插件 API 參考 - MicYou
description: MicYou 插件系統完整 API 手冊：C ABI 結構體、WASM 匯入匯出、權限清單、訊息協定與錯誤碼。
keywords: MicYou,插件API,Host API,WASM,Native,C ABI,權限
---

# 插件 API 參考

本文件彙整了 MicYou 插件系統提供的所有介面定義，包括 Host API、Plugin API、訊息通訊協定、權限清單與標準錯誤碼。

## 1. Host API（宿主提供的服務）

宿主透過函式表或 WASM 匯入向插件暴露底層能力。目前 Host API 版本為 `HOST_API_VERSION = 1`。

### 呼叫約定與並行安全

- **結構體依值複製**：`micyou_plugin_init(host)` 傳入的 `host` 指標僅在初始化期間有效。插件應在 `init` 階段將 `mpl_host_api_t` 結構體依值完整保存到插件私有狀態中。
- **嚴禁在音訊執行緒中呼叫**：`micyou_plugin_process` 運作在極低延遲優先級的即時音訊渲染執行緒，嚴禁在此方法內呼叫任何 Host API（包括 I/O、日誌、設定讀取或加鎖操作）。
- **追加式演進**：`mpl_host_api_t` 的新欄位一律追加在 `ctx` 之後，舊插件依既有位移依然能正確定址呼叫。

### Native C ABI（mpl_host_api_t）

```c
typedef struct mpl_host_api {
    void (*log)(void *ctx, mpl_log_level_t level, const char *msg);
    mpl_result_t (*get_config)(void *ctx, const char *key, char *out, uint32_t *out_size);
    mpl_result_t (*set_config)(void *ctx, const char *key, const char *json_value);
    mpl_result_t (*emit_event)(void *ctx, const char *topic, const char *json_payload);
    mpl_result_t (*send_message)(void *ctx, const char *target_json, const uint8_t *payload, uint32_t payload_len);
    mpl_result_t (*audio_state)(void *ctx, char *out, uint32_t *out_size);
    mpl_result_t (*connected_devices)(void *ctx, char *out, uint32_t *out_size);
    void *ctx;
    /* 擴充欄位一律追加在 ctx 之後 */
    mpl_result_t (*play_sound)(void *ctx, const char *path);
    mpl_result_t (*plugin_dir)(void *ctx, char *out, uint32_t *out_size);
    mpl_result_t (*register_hotkey)(void *ctx, const char *shortcut, uint64_t *out_id);
    mpl_result_t (*open_window)(void *ctx, const char *panel_id);
    mpl_result_t (*fs_read)(void *ctx, const char *path, char *out, uint32_t *out_size);
    mpl_result_t (*fs_write)(void *ctx, const char *path, const char *content);
    mpl_result_t (*set_timeout)(void *ctx, uint64_t ms, const char *payload, uint64_t *out_id);
    mpl_result_t (*clear_timeout)(void *ctx, uint64_t id);
    mpl_result_t (*http_request)(void *ctx, const char *method, const char *url,
                                 const char *headers_json, const char *body, uint64_t *out_id);
    mpl_result_t (*set_interval)(void *ctx, uint64_t ms, const char *payload, uint64_t *out_id);
    mpl_result_t (*clear_interval)(void *ctx, uint64_t id);
    mpl_result_t (*open_url)(void *ctx, const char *url);
    mpl_result_t (*notify)(void *ctx, const char *title, const char *body);
    mpl_result_t (*locale)(void *ctx, char *out, uint32_t *out_size);
    mpl_result_t (*host_info)(void *ctx, char *out, uint32_t *out_size);
    mpl_result_t (*clipboard_read)(void *ctx, char *out, uint32_t *out_size);
    mpl_result_t (*clipboard_write)(void *ctx, const char *text);
} mpl_host_api_t;
```

### WASM 匯入函式表（模組名稱 micyou）

| 匯入函式 | 簽名 | 說明 | 所需權限 |
| --- | --- | --- | --- |
| `log` | `(level: i32, msg_ptr: i32) -> ()` | 記錄日誌（0=Error, 1=Warn, 2=Info, 3=Debug） | 無 |
| `get_config` | `(key_ptr: i32) -> i32` | 取得設定 JSON 字串指標 | `config.read` |
| `set_config` | `(key_ptr: i32, val_ptr: i32) -> i32` | 儲存設定項目 | `config.write` |
| `emit_event` | `(topic_ptr: i32, payload_ptr: i32) -> i32` | 廣播事件 | `event.emit` |
| `send_message` | `(target_ptr: i32, payload_ptr: i32, len: i32) -> i32` | 發送跨端或插件訊息 | `message.send` |
| `audio_state` | `() -> i32` | 取得音訊流即時狀態快照 | `audio.state` |
| `connected_devices`| `() -> i32` | 取得目前已連線裝置清單 | `device.list` |
| `play_sound` | `(path_ptr: i32) -> i32` | 非同步混音播放 WAV 檔案 | `audio.play` |
| `plugin_dir` | `() -> i32` | 取得插件私有安裝目錄路徑 | 無 |
| `register_hotkey` | `(shortcut_ptr: i32) -> i64` | 註冊全域快捷鍵 | 無 |
| `fs_read` | `(path_ptr: i32) -> i32` | 讀取插件目錄內檔案（沙箱） | `fs.read` |
| `fs_write` | `(path_ptr: i32, content_ptr: i32) -> ()` | 寫入插件目錄內檔案（沙箱） | `fs.write` |
| `set_timeout` | `(ms: i64, payload_ptr: i32) -> i64` | 單次計時器 | 無 |
| `clear_timeout` | `(id: i64) -> ()` | 取消單次計時器 | 無 |
| `set_interval` | `(ms: i64, payload_ptr: i32) -> i64` | 循環計時器 | 無 |
| `clear_interval` | `(id: i64) -> ()` | 停止循環計時器 | 無 |
| `http_request` | `(method, url, headers, body) -> i64` | 非同步 HTTP 請求 | `network.io` |
| `open_url` | `(url_ptr: i32) -> ()` | 系統瀏覽器開啟 URL | `open.url` |
| `notify` | `(title_ptr: i32, body_ptr: i32) -> ()` | 發送系統通知 | 無 |
| `locale` | `() -> i32` | 查詢目前客戶端 UI 語言 | 無 |
| `host_info` | `() -> i32` | 查詢宿主版本資訊 | 無 |
| `clipboard_read` | `() -> i32` | 讀取系統剪貼簿文字 | `clipboard.read` |
| `clipboard_write` | `(text_ptr: i32) -> ()` | 寫入系統剪貼簿文字 | `clipboard.write` |

## 2. Plugin API（插件實作的介面）

### Native C 導出符號

| 符號 | 必填 | 說明 |
| --- | --- | --- |
| `micyou_plugin_info` | 是 | 回傳插件基本資訊結構體指標 |
| `micyou_plugin_init` | 是 | 初始化插件，保存 Host API 並讀取設定 |
| `micyou_plugin_deinit`| 是 | 插件卸載前釋放資源 |
| `micyou_plugin_process` | 否 | 即時音訊 DSP 原地處理 |
| `micyou_plugin_handle_event` | 否 | 宿主系統事件監聽回呼 |
| `micyou_plugin_handle_message` | 否 | 跨端及插件間訊息監聽回呼 |

### WASM 導出函式

| 導出名稱 | 必填 | 簽名 | 說明 |
| --- | --- | --- | --- |
| `memory` | 是 | memory | 導出線性記憶體供宿主互動 |
| `alloc` | 是 | `(size: i32) -> i32` | 在 WASM 堆積上配置指定大小緩衝區 |
| `dealloc` | 是 | `(ptr: i32, size: i32) -> ()` | 釋放緩衝區 |
| `init` | 否 | `() -> i32` | 初始化，回傳 0 代表成功 |
| `process` | 否 | `(ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32` | 音訊處理 |
| `handle_event` | 否 | `(json_ptr: i32) -> i32` | 事件回呼 |
| `handle_message`| 否 | `(payload_ptr: i32, len: i32) -> i32` | 跨端訊息回呼 |
| `deinit` | 否 | `() -> ()` | 清理回呼 |

## 3. 跨端通訊協定（PluginMessage）

跨端訊息使用 Protobuf 格式封裝傳輸：

```proto
message PluginMessage {
    string source = 1;       // 發送方插件 ID
    string target = 2;       // 接收方插件 ID（空字串代表廣播）
    string topic = 3;        // 訊息主題
    bytes payload = 4;       // 自訂負載二進位資料
    uint64 correlationId = 5;// RPC 請求配對 ID（非 0 代表 RPC）
    bool isResponse = 6;     // 是否為回應幀
    int32 errorCode = 7;     // 狀態碼（0 代表正常）
    string errorMessage = 8; // 錯誤訊息描述
}
```

## 4. 標準錯誤碼

| 錯誤碼 | 列舉名 | 說明 |
| --- | --- | --- |
| `0` | `OK` | 成功 |
| `1` | `NOT_FOUND` | 找不到目標資源或產物 |
| `2` | `INVALID_MANIFEST` | 清單 JSON 格式解析失敗 |
| `3` | `VALIDATION_FAILED`| 清單語意或欄位校驗不通過 |
| `4` | `UNKNOWN_PLUGIN` | 未知的插件 ID |
| `5` | `NOT_LOADED` | 插件未載入 |
| `6` | `LOAD_FAILED` | 二進位檔案載入失敗 |
| `7` | `API_VERSION_MISMATCH` | API 版本不相容 |
| `8` | `PERMISSION_DENIED` | 未在清單中宣告所需能力權限 |
| `9` | `ALREADY_EXISTS` | 插件已存在 |
| `10` | `RUNTIME_ERROR` | 執行異常（包含 WASM Trap 與燃料耗盡） |
| `11` | `MESSAGE_DELIVERY_FAILED` | 跨端訊息投遞失敗或逾時 |
| `12` | `IO_ERROR` | 檔案讀寫或底層 I/O 錯誤 |

## 5. 權限能力清單（Capabilities）

| 能力名稱 | 授予的操作 | 安全等級 |
| --- | --- | --- |
| `dsp.node` | 註冊音訊處理節點並讀取即時音訊資料 | 敏感（即時音訊流存取） |
| `config.read` | 讀取插件持久化設定 | 普通 |
| `config.write` | 儲存插件持久化設定 | 普通 |
| `event.emit` | 向匯流排廣播事件 | 普通 |
| `message.send` | 發送跨端與插件間通訊資料 | 普通 |
| `audio.state` | 取得取樣率、音量電平與流狀態 | 普通 |
| `audio.play` | 播放音訊並混音至虛擬麥克風 | 普通 |
| `device.list` | 取得已連線的手機與桌面裝置資訊 | 普通 |
| `network.io` | 發起非同步出站 HTTP 請求 | 敏感（網路存取） |
| `open.url` | 呼叫系統預設瀏覽器開啟網頁 | 普通 |
| `clipboard.read` | 讀取系統剪貼簿文字 | 敏感（剪貼簿存取） |
| `clipboard.write`| 寫入文字至系統剪貼簿 | 普通 |
| `fs.read` | 讀取插件私有目錄內的檔案 | 受限沙箱 |
| `fs.write` | 寫入檔案至插件私有目錄 | 受限沙箱 |
