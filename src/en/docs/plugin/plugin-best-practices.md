---
title: MicYou Plugin Architecture & Best Practices
description: Plugin architecture, security model, version compatibility strategies, and the Android extensibility roadmap.
keywords: MicYou,plugins,best practices,security model,version compatibility,Android
---

# Plugin Architecture & Best Practices

## Extensibility Points for Android

### Unified Protocols + Separated Implementations

The plugin architecture follows a "Unified Protocol + Separated Implementation" design pattern between desktop and mobile:

- **Unified**: Manifest schema ([`plugin.json`](/en/docs/plugin/plugin-package-format)), [Host API capability descriptions](/en/docs/plugin/plugin-api-reference), cross-device message protocol (Protobuf `PluginMessage`, see [Plugin System Overview](/en/docs/plugin/plugin-overview#cross-device-synchronization-model)), and event bus semantics (Pub/Sub and RPC) are shared across all platforms.
- **Separated**: Plugin loaders (Native cdylib loader vs. WASM runtime) and host wiring (Host API implementations and network transport adapters) are implemented specifically per target platform.

### Desktop Reusable Modules

| Module | Reusable on Android | Notes |
| --- | --- | --- |
| `manifest.rs` | Yes | Pure Rust, zero platform dependencies |
| `plugin.rs` (Abstract Contract) | Yes | Runtime-agnostic plugin trait |
| `bus.rs` (PluginBus) | Yes | Pure Rust event routing |
| `sync.rs` (Wire Codec) | Yes | Relies on `micyou-protocol` |
| `wasm.rs` (wasmi Runtime) | Yes | Pure Rust interpreter without native dependencies, embeddable in JNI |
| `native.rs` (libloading) | No | Android requires platform-specific loading mechanisms |
| `abi.rs` + `micyou_plugin_abi.h` | Reference | Android can provide JNI bindings maintaining equivalent semantics (see [API Reference](/en/docs/plugin/plugin-api-reference#c-abi-declaration-micyou_plugin_abih)) |

## Android Roadmap

### Why Avoid Heavy Dynamic Plugin Frameworks

Heavy dynamic Android plugin frameworks (such as RePlugin, Shadow, VirtualAPK) focus on application-level virtualization (Activity/Service hijacking, dynamic resource patching), which is over-engineered for MicYou:

- **Package Size**: Heavy runtime overhead is unsuitable for a lightweight single-module app.
- **Capability Mismatch**: MicYou plugins require [DSP nodes](/en/docs/plugin/plugin-development-guide#real-time-dsp-plugin-specification), telemetry, and background events rather than view routing and dynamic component hot-swapping.
- **Security Conflict**: Arbitrary APK execution conflicts with sandboxing and capability gating models.
- **Maintenance Cost**: High maintenance burden tied to specific AGP and Kotlin compiler versions (see [Android Compatibility Build](/en/docs/android-compat)).

Recommended path: **Protocol Alignment → Lightweight Runtime → Cross-Device Synchronization**.

### Phased Roadmap

#### Phase 1: Protocol Alignment (Core)
- Implement [`plugin.json`](/en/docs/plugin/plugin-package-format) validation aligned with JSON schema.
- Integrate Protobuf `PluginMessage` into the Android TCP control stream.
- Provide lightweight `PluginBus` implementation matching desktop semantics.

#### Phase 2: Lightweight Runtimes
- **WASM**: Primary choice (`wasmi` compiles cleanly on Android with built-in memory isolation).
- **Trusted `.so`**: Targeted at low-latency DSP pipelines, loaded exclusively from verified built-in sources or [Official Marketplace](/en/docs/plugin/plugin-marketplace-policy).
- **Lightweight DEX**: Isolated tool loaders using `PathClassLoader`.

#### Phase 3: Cross-Device Sync
- Full `PluginMessage` local dispatch and remote forwarding.
- Inter-device plugin discovery.
- Real-time sensor forwarding and remote audio DSP manipulation.

## Capability Matrix

| Capability | Desktop | Android | Description |
| --- | --- | --- | --- |
| Manifest & Capabilities | ✅ | ✅ | Same schema, see [Package Format](/en/docs/plugin/plugin-package-format) |
| Host API Semantics | ✅ | ✅ | Same semantics, see [API Reference](/en/docs/plugin/plugin-api-reference) |
| WASM Runtime | ✅ | Planned | Identical `.wasm` module, see [Development Guide](/en/docs/plugin/plugin-development-guide#writing-wasm-plugins) |
| Native Runtime | cdylib + libloading | Trusted `.so` + JNI (Planned) | Platform-specific loader, see [Development Guide](/en/docs/plugin/plugin-development-guide#writing-native-plugins) |
| Wire Protocol | ✅ | ✅ (Phase 1) | Shared Protobuf format |
| Local Plugin Bus | ✅ | ✅ (Phase 1) | Same event bus model |
| Remote Plugin Bus | ✅ | ✅ (Phase 3) | Same network transport, see [Overview](/en/docs/plugin/plugin-overview#cross-device-synchronization-model) |
| DSP Chain Node | ✅ ([`Plugins` node](/en/docs/plugin/plugin-overview#relationship-with-the-dsp-audio-pipeline)) | Planned | Pipelined inside AudioRecord stream |
| UI Buttons Panel | ✅ (`ui.route=buttons`) | Planned | Soundpad and action grids, see [Soundpad Example](/en/docs/plugin/plugin-development-guide#soundpad-native-soundpad) |
| Settings Panels | ✅ (`ui.panels`) | Planned | Sandboxed iframe + postMessage, see [Panels Guide](/en/docs/plugin/plugin-development-guide#dedicated-plugin-settings-panels-uipanels) |
| Global Hotkeys | ✅ (`register_hotkey`) | Planned | OS-level hotkey routing, see [Hotkeys](/en/docs/plugin/plugin-development-guide#global-hotkeys) |
| Audio Playback | ✅ (`audio.play`) | Planned | Mapped to MediaPlayer |
| Management UI | ✅ (Vue) | Planned | Jetpack Compose panel, see [User Guide](/en/docs/plugin/plugin-user-guide#managing-plugins-in-the-gui) |

## Version Compatibility & Decoupling Strategy

- **Host API Versioning** (`apiVersion`): The host supports version range negotiation (currently `MIN_SUPPORTED_API_VERSION = 1`, `HOST_API_VERSION = 2`). Plugins declaring v1 or v2 load smoothly; unsupported versions return error code 7 (see [API Reference Error Codes](/en/docs/plugin/plugin-api-reference#error-codes)).
- **ABI Stability** (Native): `MPL_ABI_VERSION` protects the struct layout. Breaking modifications increment the ABI version.
- **Append-Only Function Tables**: New fields in `mpl_host_api_t` are strictly appended after `ctx`. Existing field memory offsets remain immutable, ensuring backward compatibility without recompilation.
- **Lifecycle Decoupling**: The plugin runtime is decoupled from the frontend GUI. Servers launched via GUI, CLI, or interactive TUI automatically load and run enabled plugins in headless mode.
- **minHostVersion**: Plugins declare the minimum required host API version (`semver`). Major version mismatches are rejected safely.
- **WASM Import Tables**: New host imports do not break existing plugins that omit them. Signature mismatches raise trapped errors rather than host crashes.

## Security Model

### Native Plugins
- Executed in-process with full memory access. The host enforces capability verification and version checks.
- Plugins must be installed from trusted sources (all [marketplace plugins](/en/docs/plugin/plugin-marketplace-policy) are audited).
- Real-time safety is declared via `realtimeSafe`; violators causing audio dropouts are sandboxed or disabled (see [Real-time DSP Specs](/en/docs/plugin/plugin-development-guide#real-time-dsp-plugin-specification)).

### WASM Plugins
- **Memory Sandbox**: Interpreted by `wasmi`, preventing arbitrary memory access.
- **Fuel Metering**: Each call is allocated a fixed fuel budget (default 100,000) to trap infinite loops.
- **Capability Gating**: Host functions enforce declared manifest capabilities on every invocation (`MPL_ERR_PERMISSION`, see [Capabilities List](/en/docs/plugin/plugin-api-reference#capabilities-permission-list)).
- **Zero OS Access**: No unmediated file, network, or process access.

### Telemetry & Audit
- Independent ring buffer logs (500 lines per plugin) viewable in the [GUI Plugin Manager](/en/docs/plugin/plugin-user-guide#managing-plugins-in-the-gui).
- Host logs record plugin lifecycle, errors, and load failures.
