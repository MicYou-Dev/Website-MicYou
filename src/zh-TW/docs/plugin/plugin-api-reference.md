---
title: MicYou 插件 API 參考
description: 完整 Host API 參考：C ABI、WASM import、權限、消息協議與錯誤碼
keywords: MicYou,插件API,Host API,WASM,native,C ABI,權限
---


插件系統的完整接口定義：Host API、Plugin API、消息協議 / 事件定義、錯誤碼與權限清單

## Host API（宿主向插件提供的服務）

API 版本：`HOST_API_VERSION = 1`（見 manifest `apiVersion`）
- 追加式演進：**新字段只能加在 `mpl_host_api_t` 的 `ctx` 之後**，禁止插入中間，舊插件按舊偏移仍能正確讀取
- manifest `minHostVersion` 聲明插件所需的最低宿主 API 版本，major 超過宿主版本即拒絕加載
- 插件能力（capabilities）在 manifest 中聲明，宿主在每次調用時強制檢查，越權返回 `MPL_ERR_PERMISSION`

### Native（C ABI，`mpl_host_api_t`）

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
    /* 以下字段一律追加在 ctx 之後（追加式演進，見上） */
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

### WASM（導入模塊 `micyou`）

| 導入 | 簽名 | 說明 |
| --- | --- | --- |
| `log` | `(level: i32, msg_ptr: i32) -> ()` | level：0=Error 1=Warn 2=Info 3=Debug 4=Trace |
| `get_config` | `(key_ptr: i32) -> i32` | 返回宿主分配的 JSON 指針（0 = 無該鍵） |
| `set_config` | `(key_ptr: i32, value_json_ptr: i32) -> i32` | 返回結果碼 |
| `emit_event` | `(topic_ptr: i32, payload_json_ptr: i32) -> i32` | 返回結果碼 |
| `send_message` | `(target_json_ptr: i32, payload_ptr: i32, len: i32) -> i32` | 返回結果碼 |
| `audio_state` | `() -> i32` | 返回宿主分配的 JSON 指針 |
| `connected_devices` | `() -> i32` | 返回宿主分配的 JSON 數組指針 |
| `play_sound` | `(path_ptr: i32) -> i32` | 排隊播放 WAV（需 audio.play），返回結果碼 |
| `plugin_dir` | `() -> i32` | 返回插件安裝目錄絕對路徑字符串 |
| `register_hotkey` | `(shortcut_ptr: i32) -> i64` | 註冊全局快捷鍵（僅 X11 會話），返回句柄 id（0 = 失敗） |
| `open_window` | `(panel_ptr: i32) -> i32` | 打開插件自己的面板窗口 |
| `fs_read` | `(path_ptr: i32) -> i32` | 讀取插件目錄內文本文件（需 fs.read），返回字符串指針 |
| `fs_write` | `(path_ptr: i32, content_ptr: i32) -> ()` | 寫文件（需 fs.write） |
| `set_timeout` | `(ms: i64, payload_ptr: i32) -> i64` | 一次性定時器，返回 id |
| `clear_timeout` | `(id: i64) -> ()` | 取消定時器 |
| `http_request` | `(method_ptr, url_ptr, headers_ptr, body_ptr) -> i64` | 異步 HTTP（需 network.io），返回請求 id |
| `set_interval` | `(ms: i64, payload_ptr: i32) -> i64` | 循環定時器，返回 id |
| `clear_interval` | `(id: i64) -> ()` | 停止循環定時器 |
| `open_url` | `(url_ptr: i32) -> ()` | 默認瀏覽器打開（需 open.url） |
| `notify` | `(title_ptr: i32, body_ptr: i32) -> ()` | 系統通知 |
| `locale` | `() -> i32` | 宿主 UI 語言（如 zh-CN / en），字符串指針 |
| `host_info` | `() -> i32` | 宿主身份 JSON 字符串指針 |
| `clipboard_read` | `() -> i32` | 讀剪貼板（需 clipboard.read） |
| `clipboard_write` | `(text_ptr: i32) -> ()` | 寫剪貼板（需 clipboard.write） |

### 緩衝區契約（out / out_size）

- `out` / `out_size` 描述插件提供的緩衝區（UTF-8）
- 成功：寫入 NUL 結尾字符串，`*out_size` = 字節數（不含 NUL），返回 `MPL_OK`
- 緩衝區太小：`*out_size` = 所需大小，返回 `MPL_ERR_BUFFER_TOO_SMALL`
- `audio_state` 返回 JSON 快照：

```json
{ "streaming": true, "sampleRate": 48000, "channels": 1, "inputLevel": 0.42, "processedLevel": 0.38, "queuedMs": 12.5, "muted": false }
```

- `connected_devices` 返回 JSON 數組：

```json
[ { "mode": "wifi", "label": "MicYou Mobile", "audioActive": true } ]
```

- `host_info` 返回：

```json
{ "name": "micyou", "version": "2.0.0", "apiVersion": 1 }
```

### play_sound（音頻播放）

- 參數為 WAV 文件路徑，相對路徑解析到插件自己的安裝目錄（插件可自帶或動態生成音效文件）
- 音效**混入虛擬麥克風輸出流**（SoundMixer），對方與用戶都能聽到，等同於真實麥克風輸入
- 排隊即返回，混音在輸出設備線程完成，**非實時安全**，禁止在 process 中調用
- 常見用法：ui 按鈕面板（`ui.route=buttons`）點擊 → `handle_message` 收到 `ui:play` → 查配置 → `play_sound`

### register_hotkey（全局快捷鍵）

- 參數為快捷鍵字符串（如 `ctrl+shift+p`），返回句柄 id
- 按下時宿主經總線投遞消息給插件：topic `hotkey:<id>`，payload `{"shortcut":"..."}`
- 插件在 `handle_message` 中處理；進程退出自動註銷
- 快捷鍵格式由 global-hotkey 解析：修飾鍵 ctrl/alt/shift/super/cmd + 鍵名（字母、數字、f1-f12 等）
- **平臺限制**：僅 X11 會話可用；Wayland 會話註冊返回明確錯誤（合成器不轉發 X11 全局抓取），請改用面板按鈕

### fs_read / fs_write（文件訪問）

- 讀寫插件**自身安裝目錄內**的 UTF-8 文本文件（需 `fs.read` / `fs.write`）
- 路徑沙箱：絕對路徑與 `..` 穿越一律拒絕（`sandbox_path`），插件無法觸及目錄外文件
- `fs_write` 自動創建父目錄
- 常見用途：緩存、狀態文件、生成資源（音效、腳本）、插件數據持久化

### set_timeout / clear_timeout（一次性定時器）

- `set_timeout(ms, payload)` 返回定時器 id，到期後宿主經總線投遞：
  topic `timer:expired`，payload `{"timer":<id>,"payload":"<payload>"}`
- 異步事件模型：定時器線程投遞消息，不阻塞插件調用線程
- `clear_timeout(id)` 取消尚未到期的定時器

### set_interval / clear_interval（循環定時器）

- `set_interval(ms, payload)` 返回循環定時器 id，每隔 `ms` 毫秒投遞：
  topic `interval:tick`，payload `{"interval":<id>,"payload":"<payload>"}`
- `clear_interval(id)` 停止；插件卸載時宿主自動停止其全部定時器

### http_request（異步 HTTP）

- `http_request(method, url, headersJson, body)` 返回請求 id（需 `network.io`）
- 請求在宿主線程執行（10 秒超時），響應經總線異步投遞：
  topic `http:response`，payload `{"request":<id>,"ok":true,"status":200,"body":"...","error":null}`
- 失敗時 `ok=false` 且 `error` 含原因
- 插件不得在實時音頻線程（process）中發起請求

### open_url / notify（外部動作）

- `open_url(url)`：系統默認瀏覽器打開（需 `open.url`）
- `notify(title, body)`：系統通知（無能力要求）

### locale / host_info（環境查詢）

- `locale()`：宿主當前 UI 語言（如 `zh-CN`、`en`），插件面板據此切換自身文案
- `host_info()`：宿主身份與 API 版本，用於運行時兼容判斷

### clipboard_read / clipboard_write（剪貼板）

- 讀/寫系統剪貼板文本（需 `clipboard.read` / `clipboard.write`）
- 常見用途：自動化複製粘貼、把插件生成內容送剪貼板

### 事件投遞（宿主 → 插件）

- 設備連接/斷開時宿主向所有已加載插件派發 `PluginEvent::DeviceConnected`（含 mode/label）與 `DeviceDisconnected`
- 插件在 `handle_event` 中處理（native 為 `micyou_plugin_handle_event`，wasm 為 `handle_event` 導出）

## Plugin API（插件向宿主實現的接口）

### Native（C ABI 符號）

| 符號 | 必需 | 說明 |
| --- | --- | --- |
| `micyou_plugin_info` | 是 | 返回靜態 `mpl_plugin_info_t`，含 ABI / API 版本與 id |
| `micyou_plugin_init(host)` | 是 | 保存 host 表，讀取配置，返回結果碼 |
| `micyou_plugin_deinit` | 是 | 清理（宿主卸載庫前調用一次） |
| `micyou_plugin_process(data, samples, channels, queued_ms, bypass)` | 否 | 實時 DSP |
| `micyou_plugin_handle_event(type, json)` | 否 | 事件通知 |
| `micyou_plugin_handle_message(source, topic, payload, len)` | 否 | 跨端消息 |

### WASM（導出）

| 導出 | 必需 | 說明 |
| --- | --- | --- |
| `memory` | 是 | 線性內存 |
| `alloc` / `dealloc` | 是 | 內存分配（宿主寫字符串 / 音頻數據用） |
| `api_version` | 否 | 返回 Host API 版本（1） |
| `init` | 否 | 初始化，0 = 成功 |
| `process` | 否 | DSP，0 = ok 1 = bypass |
| `handle_event` | 否 | 事件（JSON 指針） |
| `handle_message` | 否 | 跨端消息（指針, 長度） |
| `deinit` | 否 | 反初始化 |

### 事件類型（`PluginEvent`）

| 事件 | 負載 |
| --- | --- |
| `device_connected` | `{ mode, label }` |
| `device_disconnected` | — |
| `mute_changed` | `{ muted }` |
| `dsp_settings_changed` | — |
| `state_changed` | `{ enabled }` |

## 消息協議

線協議為 protobuf（`crates/micyou-protocol/proto/network.proto`），掛載在控制通道 `MessageWrapper` 字段 7：

```proto
message PluginMessage {
    string source = 1;       // 發送方插件 id
    string target = 2;       // 接收方插件 id，"" = 廣播
    string topic = 3;        // 主題
    bytes payload = 4;       // 插件自定義負載
    uint64 correlationId = 5;
    bool isResponse = 6;
    int32 errorCode = 7;     // 0 = ok
    string errorMessage = 8;
}
```

語義：

- **發佈訂閱**：`target` 為空，按 `topic` 分發（本地訂閱者 + 遠端廣播）
- **請求響應**：`correlationId` 非 0 配對請求與響應；`isResponse` 標記響應
- **錯誤響應**：`errorCode` 非 0 + `errorMessage`

## 錯誤碼

`PluginError` 與 wire 錯誤碼的穩定映射（改變即破壞兼容）：

| 碼 | 含義 |
| --- | --- |
| 0 | ok |
| 1 | not found（入口產物缺失） |
| 2 | invalid manifest |
| 3 | validation failed（清單語義校驗） |
| 4 | unknown plugin |
| 5 | not loaded |
| 6 | load failed |
| 7 | api version mismatch |
| 8 | permission denied（能力未授予） |
| 9 | already exists |
| 10 | runtime error（含 WASM trap / 燃料耗盡） |
| 11 | message delivery failed（無設備 / 超時） |
| 12 | io error |

Native 的 `mpl_result_t` 數值與此保持一致（0-5 子集）

## 權限清單

| 能力 | 授予的 API | 風險 |
| --- | --- | --- |
| `dsp.node` | 處理鏈節點註冊 | 實時音頻數據訪問 |
| `config.read` | get_config | 插件自身配置 |
| `config.write` | set_config | 插件自身配置 |
| `event.emit` | emit_event | 總線事件（含遠端廣播） |
| `message.send` | send_message | 跨端消息 |
| `audio.state` | audio_state | 音頻流狀態快照 |
| `audio.play` | play_sound | 播放 WAV 音效（異步，非實時） |
| `device.list` | connected_devices | 已連接設備信息 |
| `network.io` | http_request | 出站 HTTP（異步，10s 超時） |
| `open.url` | open_url | 默認瀏覽器打開鏈接 |
| `clipboard.read` | clipboard_read | 讀取剪貼板文本 |
| `clipboard.write` | clipboard_write | 寫入剪貼板文本 |
| `fs.read` | fs_read | 插件目錄內文件讀取（沙箱） |
| `fs.write` | fs_write | 插件目錄內文件寫入（沙箱，自動建父目錄） |
| `register_hotkey` | 無需能力 | 全局快捷鍵（僅 X11，觸發僅通知註冊的插件） |
| 無 | set_timeout/clear_timeout/set_interval/clear_interval | 定時器（不訪問資源） |
| 無 | notify/locale/host_info/plugin_dir/open_window | 通知與環境查詢 |

- 未知能力聲明會被清單校驗拒絕
- 未聲明能力的 API 調用被 host 回調層拒絕（`MPL_ERR_PERMISSION` / 錯誤碼 8）
