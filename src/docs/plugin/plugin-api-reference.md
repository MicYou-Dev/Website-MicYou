---
title: 插件 API 参考 - MicYou
description: MicYou 插件系统完整 API 手册：C ABI 结构体、WASM 导入导出、权限清单、消息协议与错误码。
keywords: MicYou,插件API,Host API,WASM,Native,C ABI,权限
---

# 插件 API 参考

本文档汇总了 MicYou 插件系统提供的所有接口定义，包括 Host API、Plugin API、消息通信协议、权限清单与标准错误码。

## 1. Host API（宿主提供的服务）

宿主通过函数表或 WASM 导入向插件暴露底层能力。当前 Host API 版本为 `HOST_API_VERSION = 1`。

### 调用约定与并发安全

- **结构体按值拷贝**：`micyou_plugin_init(host)` 传入的 `host` 指针仅在初始化期间有效。插件应在 `init` 阶段将 `mpl_host_api_t` 结构体按值完整保存到插件私有状态中。
- **严禁在音频线程中调用**：`micyou_plugin_process` 运行在极低延迟优先级的实时音频渲染线程，严禁在此方法内调用任何 Host API（包括 I/O、日志、配置读取或加锁操作）。
- **追加式演进**：`mpl_host_api_t` 的新字段一律追加在 `ctx` 之后，旧插件按已有偏移依然能正确寻址调用。

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
    /* 扩展字段一律追加在 ctx 之后 */
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

### WASM 导入函数表（模块名 micyou）

| 导入函数 | 签名 | 说明 | 所需权限 |
| --- | --- | --- | --- |
| `log` | `(level: i32, msg_ptr: i32) -> ()` | 记录日志（0=Error, 1=Warn, 2=Info, 3=Debug） | 无 |
| `get_config` | `(key_ptr: i32) -> i32` | 获取配置 JSON 字符串指针 | `config.read` |
| `set_config` | `(key_ptr: i32, val_ptr: i32) -> i32` | 保存配置项 | `config.write` |
| `emit_event` | `(topic_ptr: i32, payload_ptr: i32) -> i32` | 广播事件 | `event.emit` |
| `send_message` | `(target_ptr: i32, payload_ptr: i32, len: i32) -> i32` | 发送跨端或插件消息 | `message.send` |
| `audio_state` | `() -> i32` | 获取音频流实时状态快照 | `audio.state` |
| `connected_devices`| `() -> i32` | 获取当前已连接设备列表 | `device.list` |
| `play_sound` | `(path_ptr: i32) -> i32` | 异步混音播放 WAV 文件 | `audio.play` |
| `plugin_dir` | `() -> i32` | 获取插件私有安装目录路径 | 无 |
| `register_hotkey` | `(shortcut_ptr: i32) -> i64` | 注册全局快捷键 | 无 |
| `fs_read` | `(path_ptr: i32) -> i32` | 读取插件目录内文件（沙箱） | `fs.read` |
| `fs_write` | `(path_ptr: i32, content_ptr: i32) -> ()` | 写入插件目录内文件（沙箱） | `fs.write` |
| `set_timeout` | `(ms: i64, payload_ptr: i32) -> i64` | 单次定时器 | 无 |
| `clear_timeout` | `(id: i64) -> ()` | 取消单次定时器 | 无 |
| `set_interval` | `(ms: i64, payload_ptr: i32) -> i64` | 循环定时器 | 无 |
| `clear_interval` | `(id: i64) -> ()` | 停止循环定时器 | 无 |
| `http_request` | `(method, url, headers, body) -> i64` | 异步 HTTP 请求 | `network.io` |
| `open_url` | `(url_ptr: i32) -> ()` | 系统浏览器打开 URL | `open.url` |
| `notify` | `(title_ptr: i32, body_ptr: i32) -> ()` | 发送系统通知 | 无 |
| `locale` | `() -> i32` | 查询当前客户端 UI 语言 | 无 |
| `host_info` | `() -> i32` | 查询宿主版本信息 | 无 |
| `clipboard_read` | `() -> i32` | 读取系统剪贴板文本 | `clipboard.read` |
| `clipboard_write` | `(text_ptr: i32) -> ()` | 写入系统剪贴板文本 | `clipboard.write` |

## 2. Plugin API（插件实现的接口）

### Native C 导出符号

| 符号 | 必选 | 说明 |
| --- | --- | --- |
| `micyou_plugin_info` | 是 | 返回插件基本信息结构体指针 |
| `micyou_plugin_init` | 是 | 初始化插件，保存 Host API 并读取配置 |
| `micyou_plugin_deinit`| 是 | 插件卸载前释放资源 |
| `micyou_plugin_process` | 否 | 实时音频 DSP 原地处理 |
| `micyou_plugin_handle_event` | 否 | 宿主系统事件监听回调 |
| `micyou_plugin_handle_message` | 否 | 跨端及插件间消息监听回调 |

### WASM 导出函数

| 导出名称 | 必选 | 签名 | 说明 |
| --- | --- | --- | --- |
| `memory` | 是 | memory | 导出线性内存供宿主交互 |
| `alloc` | 是 | `(size: i32) -> i32` | 在 WASM 堆上分配指定大小缓冲区 |
| `dealloc` | 是 | `(ptr: i32, size: i32) -> ()` | 释放缓冲区 |
| `init` | 否 | `() -> i32` | 初始化，返回 0 代表成功 |
| `process` | 否 | `(ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32` | 音频处理 |
| `handle_event` | 否 | `(json_ptr: i32) -> i32` | 事件回调 |
| `handle_message`| 否 | `(payload_ptr: i32, len: i32) -> i32` | 跨端消息回调 |
| `deinit` | 否 | `() -> ()` | 清理回调 |

## 3. 跨端通信协议（PluginMessage）

跨端消息使用 Protobuf 格式封装传输：

```proto
message PluginMessage {
    string source = 1;       // 发送方插件 ID
    string target = 2;       // 接收方插件 ID（空字符串代表广播）
    string topic = 3;        // 消息主题
    bytes payload = 4;       // 自定义负载二进制数据
    uint64 correlationId = 5;// RPC 请求配对 ID（非 0 代表 RPC）
    bool isResponse = 6;     // 是否为响应帧
    int32 errorCode = 7;     // 状态码（0 代表正常）
    string errorMessage = 8; // 错误信息描述
}
```

## 4. 标准错误码

| 错误码 | 枚举名 | 说明 |
| --- | --- | --- |
| `0` | `OK` | 成功 |
| `1` | `NOT_FOUND` | 找不到目标资源或产物 |
| `2` | `INVALID_MANIFEST` | 清单 JSON 格式解析失败 |
| `3` | `VALIDATION_FAILED`| 清单语义或字段校验不通过 |
| `4` | `UNKNOWN_PLUGIN` | 未知的插件 ID |
| `5` | `NOT_LOADED` | 插件未加载 |
| `6` | `LOAD_FAILED` | 二进制文件加载失败 |
| `7` | `API_VERSION_MISMATCH` | API 版本不兼容 |
| `8` | `PERMISSION_DENIED` | 未在清单中声明所需能力权限 |
| `9` | `ALREADY_EXISTS` | 插件已存在 |
| `10` | `RUNTIME_ERROR` | 执行异常（包含 WASM Trap 与燃料耗尽） |
| `11` | `MESSAGE_DELIVERY_FAILED` | 跨端消息投递失败或超时 |
| `12` | `IO_ERROR` | 文件读写或底层 I/O 错误 |

## 5. 权限能力清单（Capabilities）

| 能力名称 | 授予的操作 | 安全级别 |
| --- | --- | --- |
| `dsp.node` | 注册音频处理节点并读取实时音频数据 | 敏感（实时音频流访问） |
| `config.read` | 读取插件持久化配置 | 普通 |
| `config.write` | 保存插件持久化配置 | 普通 |
| `event.emit` | 向总线广播事件 | 普通 |
| `message.send` | 发送跨端与插件间通信数据 | 普通 |
| `audio.state` | 获取采样率、音量电平与流状态 | 普通 |
| `audio.play` | 播放音频并混音至虚拟麦克风 | 普通 |
| `device.list` | 获取已连接的手机与桌面设备信息 | 普通 |
| `network.io` | 发起异步出站 HTTP 请求 | 敏感（网络访问） |
| `open.url` | 调用系统默认浏览器打开网页 | 普通 |
| `clipboard.read` | 读取系统剪贴板文本 | 敏感（剪贴板访问） |
| `clipboard.write`| 写入文本至系统剪贴板 | 普通 |
| `fs.read` | 读取插件私有目录内的文件 | 受限沙箱 |
| `fs.write` | 写入文件至插件私有目录 | 受限沙箱 |
