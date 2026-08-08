---
title: MicYou Plugin Development Guide
description: Quick start for the plugin system: dual runtime, manifest, example plugins and dev tools
keywords: MicYou,plugin development,WASM,native,manifest,example plugins
---

# MicYou Plugin Development Guide

## Runtime choice: WASM first

- WASM (wasmi): sandboxed, fuel-metered, ~70us per 48kHz frame vs 10ms budget
  - perfect for logic, automation, panels, and even real-time DSP
  - no native dependencies, Android-friendly
- native (cdylib): full privilege, for advanced features needing arches or
  system libs — declare `arches` in the manifest

## Minimal WASM plugin

```wat
(module
  (import "micyou" "log" (func $log (param i32 i32)))
  (memory (export "memory") 1)
  (global $heap (mut i32) (i32.const 1024))
  (func (export "alloc") (param $n i32) (result i32)
    (local $p i32)
    (local.set $p (global.get $heap))
    (global.set $heap (i32.add (global.get $heap) (local.get $n)))
    (i32.store (local.get $p) (local.get $n))
    (i32.add (local.get $p) (i32.const 4)))
  (func (export "dealloc") (param $p i32) (param $n i32))
  (func (export "api_version") (result i32) (i32.const 1))
  (func (export "init") (result i32)
    (call $log (i32.const 2) (i32.const 0))
    (i32.const 0))
  (func (export "deinit")))
```

## Minimal native plugin

A Rust cdylib exporting `micyou_plugin_info`, `micyou_plugin_init`,
`micyou_plugin_deinit` with `#[repr(C)]` ABI types (see
`include/micyou_plugin_abi.h` in the micyou-plugin crate)

```rust
#[no_mangle]
pub extern "C" fn micyou_plugin_init(host: *const mpl_host_api_t) -> mpl_result_t {
    // store host, register DSP node, set panel icon, arm timers
    mpl_result_t::MPL_OK
}
```

## Manifest

```json
{
  "id": "dev.micyou.example.timer",
  "name": "Example Timer",
  "version": "1.0.0",
  "author": "You",
  "license": "GPL-3.0-only",
  "homepage": "https://github.com/you/repo",
  "repository": "https://github.com/you/repo",
  "runtime": "wasm",
  "entry": "main.wasm",
  "apiVersion": 1,
  "capabilities": ["config.read", "config.write"],
  "kind": "utility",
  "config": { "interval": 5 },
  "configSchema": {
    "fields": [
      { "key": "interval", "fieldType": "number", "min": 1, "max": 60, "default": 5 }
    ]
  },
  "updateUrl": "https://raw.githubusercontent.com/MicYou-Dev/MicYou-Plugins/main/plugin/dev.micyou.example.timer/plugin.json"
}
```

## Dev tools

```bash
micyou plugin validate <dir>    # validate manifest + entry artifact
micyou plugin package <dir> -o plugin.zip   # zip for in-app import
micyou plugin create <id> --runtime wasm    # skeleton generator
```

## Example plugins

| Example | Runtime | Shows |
| --- | --- | --- |
| native-soundpad | native | button panel, config page, hotkey, audio.play, multi-window, set_panel_icon |
| wasm-voicechanger | wasm | real-time DSP in wasmi, config hot-reload, set_panel_icon |
| wasm-pomodoro | wasm | set_interval + notify, configSchema auto form, state persistence, set_panel_icon |

Install: open plugin page -> import the zip from the marketplace repo
(https://github.com/MicYou-Dev/MicYou-Plugins) — a permission preview lists
the requested capabilities before install
