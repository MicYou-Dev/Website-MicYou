---
title: MicYou Plugin Best Practices & Extensibility
description: Plugin architecture, security model, version compatibility and the Android roadmap
keywords: MicYou,plugins,best practices,security model,version compatibility,Android
---

# MicYou Plugin Best Practices & Extensibility

## Architecture

- Desktop: dual runtime (native cdylib + wasmi) over one protocol
- The protocol and Host API surface are shared with the future Android side
- Plugins register DSP nodes (inserted into the processing chain), UI panels,
  commands, event listeners; the host authorizes declared capabilities

## Security model

- Capabilities are declared in the manifest and enforced by every host call
  (native shims return `MPL_ERR_PERMISSION`, WASM imports trap)
- fs.read/fs.write are sandboxed to the plugin's own install directory
  (absolute paths and `..` rejected)
- WASM is fuel-metered (infinite loops trapped) and memory-bounded
- install flow: permission preview before extraction, zip-slip protection
- environment variables and process execution are deliberately excluded
- native plugins are full-privilege in-process code — install only from
  sources you trust (marketplace plugins are required to be open source)

## Version compatibility

- `HOST_API_VERSION = 1`; new host-table fields are appended after `ctx` only,
  so old plugins keep working
- `minHostVersion` with a major above the host version is rejected
- semver requirement strings in `dependencies` are checked at enable time

## Android roadmap

1. protocol alignment (cross-device plugin messages use the same proto)
2. lightweight runtime (WASM preferred, or trusted .so)
3. cross-device plugin sync (sensor up, DSP params down)

Heavy plugin frameworks (RePlugin/Shadow/VirtualAPK) do not fit MicYou's
current scale — the roadmap favors protocol-first, then a minimal runtime
