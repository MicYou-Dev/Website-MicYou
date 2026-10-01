---
title: Plugin Best Practices & Architecture - MicYou
description: Architecture design principles, mobile extension roadmap, API versioning strategy, security model, and performance budgets for MicYou plugins.
keywords: MicYou,plugins,best practices,security model,version compatibility,Android,architecture
---

# Plugin Best Practices & Architecture

This document outlines the architectural principles, mobile expansion roadmap, API compatibility guarantees, security models, and performance benchmarks for the MicYou plugin system.

## 1. Mobile Extension: Unified Protocols with Decoupled Implementations

To extend plugin capabilities to Android smoothly in the future, MicYou adheres to the principle of **unified protocols with decoupled implementations** rather than adopting heavy dynamic APK loading frameworks.

### Why Avoid Heavy Dynamic APK Frameworks?

In the Android ecosystem, frameworks like RePlugin and Shadow focus on monolithic APK modularization, Activity component swapping, and app-level hot patching—which represents unnecessary overhead for MicYou:

- **Footprint & Packaging Overhead**: Complex build chains and heavy runtime footprints clash with a lightweight utility app.
- **Mismatched Goals**: MicYou plugins demand real-time audio DSP nodes, event pub/sub, and cross-device messaging rather than UI navigation routing.
- **Security Misalignment**: Dynamically executing arbitrary APK code contradicts the granular capability permission model.
- **Fragile Upstream Maintenance**: Heavy reflection-based frameworks frequently break across major Android OS and Gradle plugin upgrades.

### Three-Stage Evolution Roadmap

```text
Stage 1: Protocol Alignment ──► Stage 2: Lightweight Runtimes ──► Stage 3: End-to-End Sync
```

1. **Stage 1: Protocol Alignment (Core Foundation)**  
   - Implement `plugin.json` schema parsing and validation on mobile.
   - Integrate Protobuf `PluginMessage` wire framing into the Android TCP control session.
   - Deploy a lightweight `PluginBus` on Android to establish bidirectional messaging with desktop.

2. **Stage 2: Lightweight Runtimes**  
   - **WASM (Priority)**: Embed the pure-Rust `wasmi` interpreter for instant memory-safe execution.
   - **Trusted Native (.so)**: For compute-intensive real-time DSP, expose C ABI via JNI to load pre-verified native libraries.
   - **Lightweight DEX**: Isolated class loading via `PathClassLoader` for pure logic plugins.

3. **Stage 3: End-to-End Interoperability**  
   - Automatic cross-device plugin discovery and capability broadcasting.
   - Real-world telemetry workflows (e.g. mobile sensor capture → desktop filter processing → real-time result return).

## 2. Versioning & Decoupling Strategy

To guarantee long-term stability without breaking existing plugins, the architecture incorporates multi-tiered compatibility layers:

- **Host API Range Negotiation**: The host supports a compatible range of API versions (e.g. loading both v1 and v2 plugins simultaneously), rejecting only out-of-range versions with clear diagnostics.
- **Append-Only C ABI Function Table**: New fields in `mpl_host_api_t` are **strictly appended after `ctx`**. Existing function pointer offsets remain unchanged, ensuring backward binary compatibility for existing native plugins without recompilation.
- **ABI Version Guard**: `MPL_ABI_VERSION` locks struct memory layouts, incrementing only on breaking structural changes.
- **Proto3 Wire Forward Compatibility**: Network messaging uses Proto3 unknown-field skipping, allowing older clients to coexist safely with newer message schemas.
- **Frozen Error Code Space**: Error codes 0 through 12 have immutable semantics; future additions are append-only.

## 3. Security Model

### Native Plugins
- **In-Process Execution**: Native plugins share process memory with the host; access is governed by capability declarations and code verification.
- **Real-Time Safety Contract**: The plugin affirms real-time safety via `realtimeSafe: true`. Violations causing audio stutter remain the responsibility of the plugin author.

### WASM Plugins
- **Linear Memory Sandbox**: Runs in isolated memory pages with no access to host heap or pointers.
- **Instruction Fuel Budget**: Each entry invocation receives a fixed fuel allocation (default: 100,000) to prevent infinite loops from hanging the host process.
- **Per-Call Capability Check**: Host API invocations are validated against the manifest `capabilities` array, rejecting unauthorized calls with `MPL_ERR_PERMISSION`.

## 4. Performance Budget & DSP Guidelines

- **DSP Frame Budget**: At 48 kHz / 480 samples per frame (~10ms buffer window), individual plugin processing time should stay strictly **under 1ms**.
- **Zero Lock Contention**: The audio thread processing loop must avoid mutex locks; configuration updates should propagate via atomic variables or lockless double-buffers.
- **Runtime Choice**: Use WASM for workflows, UI bridges, and general logic; choose Native for compute-heavy real-time DSP.
