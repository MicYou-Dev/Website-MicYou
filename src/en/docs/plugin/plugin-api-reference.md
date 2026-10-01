---
title: Plugin API Reference - MicYou
description: "Complete Host API specification for MicYou plugins: C ABI structures, WASM imports/exports, permission capabilities, wire protocol, and error codes."
keywords: MicYou,plugin API,Host API,WASM,Native,C ABI,capabilities
---

# Plugin API Reference

This reference documents the complete interface definitions for MicYou plugins, including Host APIs, Plugin APIs, cross-device wire protocols, capability permissions, and standard error codes.

## 1. Host API (Services Provided by Host)

The host exposes core capabilities via function pointers (Native) or WASM module imports. The current Host API version is `HOST_API_VERSION = 1`.

### Calling Conventions & Concurrency Safety

- **By-Value Copy**: The `host` pointer passed into `micyou_plugin_init` is only guaranteed to be valid during the initialization call. Plugins should copy `mpl_host_api_t` by value into private global state.
- **Strictly Prohibited in Audio Threads**: `micyou_plugin_process` executes on a high-priority, real-time audio thread. Never invoke any Host API (including I/O, logging, config access, or locking primitives) inside this method.
- **Append-Only Evolution**: New fields in `mpl_host_api_t` are appended strictly after `ctx` to preserve struct field offsets for backwards compatibility.

### Native C ABI (mpl_host_api_t)

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
    /* New functions are appended after ctx */
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

### WASM Imports (Module Name: micyou)

| Import Function | Signature | Description | Required Capability |
| --- | --- | --- | --- |
| `log` | `(level: i32, msg_ptr: i32) -> ()` | Write log message (0=Error, 1=Warn, 2=Info, 3=Debug) | None |
| `get_config` | `(key_ptr: i32) -> i32` | Read JSON configuration string | `config.read` |
| `set_config` | `(key_ptr: i32, val_ptr: i32) -> i32` | Save configuration value | `config.write` |
| `emit_event` | `(topic_ptr: i32, payload_ptr: i32) -> i32` | Broadcast event | `event.emit` |
| `send_message` | `(target_ptr: i32, payload_ptr: i32, len: i32) -> i32` | Send cross-device message | `message.send` |
| `audio_state` | `() -> i32` | Get real-time audio stream snapshot | `audio.state` |
| `connected_devices`| `() -> i32` | List currently connected devices | `device.list` |
| `play_sound` | `(path_ptr: i32) -> i32` | Mix WAV file into virtual microphone stream | `audio.play` |
| `plugin_dir` | `() -> i32` | Get private plugin install path | None |
| `register_hotkey` | `(shortcut_ptr: i32) -> i64` | Register global shortcut | None |
| `fs_read` | `(path_ptr: i32) -> i32` | Read file inside plugin directory (sandboxed) | `fs.read` |
| `fs_write` | `(path_ptr: i32, content_ptr: i32) -> ()` | Write file inside plugin directory (sandboxed) | `fs.write` |
| `set_timeout` | `(ms: i64, payload_ptr: i32) -> i64` | One-shot timer | None |
| `clear_timeout` | `(id: i64) -> ()` | Cancel one-shot timer | None |
| `set_interval` | `(ms: i64, payload_ptr: i32) -> i64` | Repeating interval timer | None |
| `clear_interval` | `(id: i64) -> ()` | Clear interval timer | None |
| `http_request` | `(method, url, headers, body) -> i64` | Asynchronous HTTP request | `network.io` |
| `open_url` | `(url_ptr: i32) -> ()` | Open URL in default browser | `open.url` |
| `notify` | `(title_ptr: i32, body_ptr: i32) -> ()` | Display system notification | None |
| `locale` | `() -> i32` | Query host UI language | None |
| `host_info` | `() -> i32` | Query host version information | None |
| `clipboard_read` | `() -> i32` | Read text from system clipboard | `clipboard.read` |
| `clipboard_write` | `(text_ptr: i32) -> ()` | Write text to system clipboard | `clipboard.write` |

## 2. Plugin API (Interfaces Implemented by Plugins)

### Native C Exports

| Symbol | Required | Description |
| --- | --- | --- |
| `micyou_plugin_info` | Yes | Returns static metadata struct pointer |
| `micyou_plugin_init` | Yes | Initializes plugin and stores Host API pointer |
| `micyou_plugin_deinit`| Yes | Cleans up resources before unloading |
| `micyou_plugin_process` | No | Real-time audio DSP processing |
| `micyou_plugin_handle_event` | No | Host event listener |
| `micyou_plugin_handle_message` | No | Cross-device & inter-plugin message handler |

### WASM Exports

| Export Name | Required | Signature | Description |
| --- | --- | --- | --- |
| `memory` | Yes | memory | Linear memory export |
| `alloc` | Yes | `(size: i32) -> i32` | Allocates memory for host writes |
| `dealloc` | Yes | `(ptr: i32, size: i32) -> ()` | Deallocates memory |
| `init` | No | `() -> i32` | Initialization hook (0 = success) |
| `process` | No | `(ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32` | DSP processing |
| `handle_event` | No | `(json_ptr: i32) -> i32` | Event listener |
| `handle_message`| No | `(payload_ptr: i32, len: i32) -> i32` | Message handler |
| `deinit` | No | `() -> ()` | Cleanup hook |

## 3. Wire Message Protocol (PluginMessage)

Cross-device messages are packaged in Protobuf format:

```proto
message PluginMessage {
    string source = 1;       // Originating plugin ID
    string target = 2;       // Target plugin ID (empty string = broadcast)
    string topic = 3;        // Message topic
    bytes payload = 4;       // Custom binary payload
    uint64 correlationId = 5;// RPC correlation ID (non-zero for RPC)
    bool isResponse = 6;     // Whether this frame is an RPC response
    int32 errorCode = 7;     // Status code (0 = OK)
    string errorMessage = 8; // Error description string
}
```

## 4. Standard Error Codes

| Error Code | Identifier | Description |
| --- | --- | --- |
| `0` | `OK` | Success |
| `1` | `NOT_FOUND` | Target resource or entry binary missing |
| `2` | `INVALID_MANIFEST` | Failed to parse manifest JSON |
| `3` | `VALIDATION_FAILED`| Manifest semantic validation failed |
| `4` | `UNKNOWN_PLUGIN` | Unregistered plugin ID |
| `5` | `NOT_LOADED` | Plugin is currently inactive |
| `6` | `LOAD_FAILED` | Binary load failed |
| `7` | `API_VERSION_MISMATCH` | Incompatible API version |
| `8` | `PERMISSION_DENIED` | Requested capability was not declared in manifest |
| `9` | `ALREADY_EXISTS` | Plugin already loaded |
| `10` | `RUNTIME_ERROR` | Runtime trap or fuel exhaustion |
| `11` | `MESSAGE_DELIVERY_FAILED` | Message delivery failed or timed out |
| `12` | `IO_ERROR` | File I/O error |

## 5. Permission Capabilities

| Capability | Granted Operation | Security Level |
| --- | --- | --- |
| `dsp.node` | Audio DSP processing & frame access | Sensitive (Live Audio) |
| `config.read` | Read plugin settings | Normal |
| `config.write` | Save plugin settings | Normal |
| `event.emit` | Broadcast bus events | Normal |
| `message.send` | Send inter-plugin & remote messages | Normal |
| `audio.state` | Inspect stream state & levels | Normal |
| `audio.play` | Mix sound into microphone output | Normal |
| `device.list` | Query connected devices | Normal |
| `network.io` | Outbound HTTP requests | Sensitive (Network) |
| `open.url` | Launch URLs in system browser | Normal |
| `clipboard.read` | Read clipboard text | Sensitive (Clipboard) |
| `clipboard.write`| Write clipboard text | Normal |
| `fs.read` | Read files in plugin directory | Sandboxed |
| `fs.write` | Write files in plugin directory | Sandboxed |
