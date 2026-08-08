---
title: MicYou Plugin API Reference
description: "Complete Host API reference: C ABI, WASM imports, permissions, message protocol and error codes"
keywords: MicYou,plugin API,Host API,WASM,native,C ABI,permissions
---

# MicYou Plugin API Reference

Host API version: `HOST_API_VERSION = 1` (manifest `apiVersion`)

## Runtime model

MicYou plugins run in one of two sandboxes

| Runtime | Loading | Best for |
| --- | --- | --- |
| native | cdylib (.so/.dylib/.dll) via libloading | real-time DSP, ONNX models, device drivers |
| wasm | wasmi sandbox, fuel-metered | logic, UI panels, automation |

Both runtimes expose the same Host API surface

## Host API (C ABI)

Native plugins receive a function table (`mpl_host_api_t`) whose fields are
appended after `ctx` only, so older plugins stay ABI-compatible

| Field | Signature | Capability |
| --- | --- | --- |
| `log` | (level, msg) | none |
| `get_config` | (key, out, out_size) | config.read |
| `set_config` | (key, value_json) | config.write |
| `emit_event` | (topic, payload) | event.emit |
| `send_message` | (target_json, payload, len) | message.send |
| `audio_state` | (out, out_size) | audio.state |
| `connected_devices` | (out, out_size) | device.list |
| `play_sound` | (path) | audio.play |
| `plugin_dir` | (out, out_size) | none |
| `register_hotkey` | (shortcut, out_id) | none (X11 only) |
| `open_window` | (panel_id) | none |
| `fs_read` | (path, out, out_size) | fs.read |
| `fs_write` | (path, content) | fs.write |
| `set_timeout` / `clear_timeout` | (ms, payload) -> id | none |
| `http_request` | (method, url, headers, body) -> id | network.io |
| `set_interval` / `clear_interval` | (ms, payload) -> id | none |
| `open_url` | (url) | open.url |
| `notify` | (title, body) | none |
| `locale` | (out, out_size) | none |
| `host_info` | (out, out_size) | none |
| `clipboard_read` / `clipboard_write` | | clipboard.read / clipboard.write |
| `set_panel_icon` | (panel_id, icon) | none |

String outputs use the plugin-owned `out`/`out_size` buffer contract
(`MPL_ERR_BUFFER_TOO_SMALL` returns the required size)

## WASM imports

Same logical API under module `micyou`, strings passed through the plugin's
exported `alloc` into linear memory

- `log(level, ptr)` `get_config(key_ptr) -> ptr` `set_config(key_ptr, value_ptr)`
- `emit_event(topic_ptr, payload_ptr)` `send_message(target_ptr, payload_ptr, len)`
- `audio_state() -> ptr` `connected_devices() -> ptr` `play_sound(path_ptr)`
- `plugin_dir() -> ptr` `register_hotkey(shortcut_ptr) -> i64`
- `open_window(panel_id_ptr)` `fs_read(path_ptr) -> ptr` `fs_write(path_ptr, content_ptr)`
- `set_timeout(ms, payload_ptr) -> i64` `clear_timeout(id)` `http_request(m,u,h,b) -> i64`
- `set_interval(ms, payload_ptr) -> i64` `clear_interval(id)` `open_url(url_ptr)`
- `notify(title_ptr, body_ptr)` `locale() -> ptr` `host_info() -> ptr`
- `clipboard_read() -> ptr` `clipboard_write(text_ptr)`
- `set_panel_icon(panel_id_ptr, icon_ptr)`

Required exports: `memory`, `alloc`, `api_version` (optional, defaults 1),
`init`, `deinit`; optional: `process` (0=ok 1=bypass), `handle_event`, `handle_message`

## Plugin API

| Entry | Signature | Purpose |
| --- | --- | --- |
| `init` | -> code | startup (register DSP node, set panel icon, arm timers) |
| `process` | (data, samples, channels, queued_ms) -> code | per-frame DSP |
| `handle_event` | (event) | host events (device connect/disconnect) |
| `handle_message` | (payload) | config changes, ui actions, timers, http responses |
| `deinit` | | teardown |

## Message topics

- `config:changed` — config hot-reload `{key, value}`
- `ui:<action>` — panel/trigger actions
- `timer:expired` / `interval:tick` — timer callbacks `{timer, payload}`
- `http:response` — async HTTP result `{request, ok, status, body, error}`
- `hotkey:<id>` — global hotkey press
- `plugin:<id>` — plugin-to-plugin messages

## Error codes

`0` ok · `1` not implemented · `2` invalid argument · `3` runtime · `4` buffer too small · `5` permission denied
