---
title: Plugin Development Guide - MicYou
description: "Complete developer tutorial for MicYou plugins: CLI tools, Manifest format, writing Native and WASM plugins, Host APIs, and cross-device communication."
keywords: MicYou,plugin development,WASM,Native,manifest,plugin examples,Host API
---

# Plugin Development Guide

This guide covers everything you need to build MicYou plugins, including Native (cdylib) and WebAssembly (WASM) modules, manifest definitions, Host API integration, and real-time DSP safety rules.

## 1. Quick Start

MicYou provides dedicated CLI commands to quickly scaffold, validate, and package plugin projects:

```bash
# Create a WebAssembly (WASM) plugin project (default)
micyou plugin create dev.micyou.myplugin

# Create a Native plugin project
micyou plugin create dev.micyou.mynative --runtime native

# Validate plugin.json and entry binaries
micyou plugin validate ./myplugin

# Package directory into a distributable ZIP archive
micyou plugin package ./myplugin -o myplugin.zip
```

### Plugin Directory Structure

```text
<plugin-folder>/
├── plugin.json          # Plugin manifest (Required)
├── <entry>              # Entry binary: .so/.dylib/.dll for Native, .wasm for WASM
└── panel.html           # Dedicated settings UI panel (Optional)
```

During local development, copy the folder into the host's plugin directory. Refreshing the settings page triggers an automatic rescan:
- **Windows**: `%APPDATA%\micyou\plugins\`
- **macOS / Linux**: `~/.config/micyou/plugins/`

## 2. Manifest (plugin.json) Specification

`plugin.json` defines your plugin's identity, entry points, and requested permissions.

### Field Reference

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Reverse domain name notation in lowercase (e.g. `dev.micyou.gain`) |
| `name` | string | Yes | Display name |
| `version` | string | Yes | SemVer version string (e.g. `1.0.0`) |
| `runtime` | string | Yes | Target runtime: `native` or `wasm` |
| `entry` | string | Yes | Relative path to the entry binary |
| `author` | string | No | Author name or contact email |
| `description` | string | No | Short description of plugin functionality |
| `license` | string | No | SPDX license identifier (e.g. `MIT`, `GPL-3.0-only`) |
| `apiVersion` | number | No | Required Host API version (currently `1`) |
| `capabilities` | string[] | No | Requested permissions (e.g. `dsp.node`, `config.read`) |
| `kind` | string | No | Plugin category: `dsp`, `utility`, `ui`, `bridge` (default: `utility`) |
| `dsp` | object | No | DSP node configuration (`insertAfter`, `first`, `realtimeSafe`) |
| `ui` | object | No | UI panel registration (`route`, `label`, `panels`) |
| `config` | object | No | Default configuration written on first install |
| `configSchema` | object | No | Declarative form schema for auto-generated UI |
| `dependencies` | object[] | No | Plugin dependencies `[{ id, version, optional }]` |
| `updateUrl` | string | No | Remote manifest URL for in-app update checks |

### Declarative Configuration Schema (configSchema)

When `configSchema` is provided, MicYou renders a native form automatically on the plugin card:

```json
"configSchema": {
  "fields": [
    { "key": "gain", "fieldType": "number", "label": "Gain Multiplier", "min": 0.5, "max": 5.0, "step": 0.1, "default": 2.0 },
    { "key": "enabled", "fieldType": "boolean", "label": "Enable Effect", "default": true },
    { "key": "mode", "fieldType": "select", "label": "Mode", "options": [{ "value": "fast", "label": "Low Latency" }] }
  ]
}
```

## 3. Writing Native Plugins

Native plugins compile into dynamic libraries (cdylib) and interface with the host via a versioned C ABI.

### Required C Symbols

```c
// Return plugin metadata (ABI version, API version, ID, name)
const mpl_plugin_info_t *micyou_plugin_info(void);

// Initialize: save Host API table pointer and read initial config
mpl_result_t micyou_plugin_init(const mpl_host_api_t *host);

// Deinitialize: clean up resources before unloading
void micyou_plugin_deinit(void);
```

### Optional C Symbols

```c
// Real-time audio DSP: in-place processing of interleaved f32 audio samples
mpl_result_t micyou_plugin_process(float *data, uint32_t samples, uint32_t channels, double queued_ms, uint32_t *bypass);

// Event listener callback
mpl_result_t micyou_plugin_handle_event(const char *type, const char *json);

// Cross-device message handler
mpl_result_t micyou_plugin_handle_message(const char *source, const char *topic, const uint8_t *payload, uint32_t payload_len);
```

### Minimal Rust Example

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

## 4. Writing WebAssembly (WASM) Plugins

WASM plugins run in the pure-Rust `wasmi` sandbox interpreter, providing safe and cross-platform portability.

### Host-Expected WASM Exports

- `memory`: Linear memory export.
- `alloc(size: i32) -> i32`: Allocates buffers inside WASM memory for host writes.
- `dealloc(ptr: i32, size: i32)`: Frees memory.
- `init() -> i32`: Initialization hook (0 = success).
- `process(data_ptr: i32, samples: i32, channels: i32, queued_ms: f64) -> i32` (optional): DSP processing.
- `handle_event(json_ptr: i32) -> i32` (optional): Event callback.
- `handle_message(payload_ptr: i32, len: i32) -> i32` (optional): Cross-device message callback.
- `deinit()` (optional): Cleanup.

### Host Imports Provided to WASM (`micyou` module)

- `log(level, msg_ptr)`: Write to plugin console.
- `get_config(key_ptr) -> json_ptr`: Read configuration value.
- `set_config(key_ptr, value_ptr) -> code`: Persist configuration.
- `emit_event(topic_ptr, payload_ptr) -> code`: Broadcast bus event.
- `send_message(target_ptr, payload_ptr, len) -> code`: Send cross-device message.
- `play_sound(path_ptr) -> code`: Mix audio file into virtual microphone stream.
- `register_hotkey(shortcut_ptr) -> hotkey_id`: Register global system shortcut.

## 5. Real-Time Audio DSP Safety Rules

To prevent audio distortion, clicks, or frame dropouts, DSP plugins must adhere to real-time audio safety standards:

- **No Heap Allocation in `process`**: Avoid `malloc`, string concatenations, or dynamic vector growth on the audio thread.
- **No Blocking I/O or Locks**: Never perform disk reads/writes, network calls, or lock acquisitions in `process`.
- **Strict Time Budget**: At 48 kHz, each 480-sample frame represents ~10ms. Single plugin execution must remain well under 1ms.
- **Preallocate State**: Pre-initialize filter coefficients, delay lines, and history ring buffers during `init`.

## 6. Dedicated Settings Panels (ui.panels)

Plugins can embed custom settings views in the application sidebar:

1. Configure `ui.panels` in `plugin.json` pointing to a self-contained HTML entry point (e.g. `panel.html`).
2. The frontend renders the view inside a sandboxed iframe.
3. Use the postMessage bridge to securely communicate with the host:

```javascript
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

// Example: retrieve config and play a sound effect
const config = await callHost('get_config', {});
await callHost('play', { id: 'beep' });
```

## 7. Testing & Debugging

- **Live Logs**: Open MicYou Desktop Settings > Plugins and click "Logs" on your plugin card to stream console output in real time.
- **State Inspection**: Click "Config" on the card to inspect or manually edit persisted JSON properties.
- **Error Diagnostics**: If a plugin fails to load, inspect the detailed error code and reason reported in the management UI.
