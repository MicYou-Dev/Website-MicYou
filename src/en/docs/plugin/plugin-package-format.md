---
title: Plugin Package Format - MicYou
description: Specifications for MicYou plugin directory structure, manifest schema, ZIP packaging, and marketplace repository layout.
keywords: MicYou,plugin package,ZIP package,marketplace,auto update,package format
---

# Plugin Package Format

This document specifies the directory layout, manifest properties, distribution packaging, and marketplace repository structure for MicYou plugins.

## 1. Directory Structure

Each plugin is organized as a dedicated directory containing at least `plugin.json` and its entry binary:

```text
<plugin-id>/
├── plugin.json      # Plugin manifest descriptor (Required)
├── <entry>          # Entry binary: .so/.dylib/.dll for Native, .wasm for WASM
└── panel.html       # Dedicated settings panel HTML (Optional)
```

Installed plugins reside in the standard application data path:
- **Windows**: `%APPDATA%\micyou\plugins\<plugin-id>\`
- **macOS / Linux**: `~/.config/micyou/plugins/<plugin-id>/`

## 2. Manifest Schema (plugin.json)

`plugin.json` uses standard JSON formatting. Common fields include:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Reverse domain name notation (e.g. `dev.micyou.noisegate`) |
| `name` | string | Yes | Display name |
| `version` | string | Yes | SemVer version string (e.g. `1.2.0`) |
| `runtime` | string | Yes | Target runtime: `wasm` or `native` |
| `entry` | string | Yes | Relative path to entry binary within plugin directory |
| `author` | string | No | Author or organization name |
| `license` | string | No | SPDX license identifier (e.g. `MIT`, `Apache-2.0`) |
| `homepage` | string | No | Project website URL |
| `repository` | string | No | Source code repository URL |
| `capabilities` | string[] | No | Requested permission capabilities |
| `kind` | string | No | Category: `dsp`, `utility`, `ui`, `bridge` |
| `dsp` | object | No | DSP node metadata (`insertAfter`, `first`, `realtimeSafe`) |
| `ui` | object | No | UI panel configuration (`route`, `label`, `panels`) |
| `config` | object | No | Default configuration JSON object |
| `configSchema` | object | No | Declarative form schema for auto-generated UI |
| `dependencies` | object[] | No | Prerequisites `[{ id, version, optional }]` |
| `updateUrl` | string | No | Remote manifest URL for update checks |
| `arches` | string[] | No | Native CPU architectures (e.g. `x86_64`, `aarch64`) |

## 3. ZIP Packaging & Import Rules

MicYou supports importing `.zip` plugin archives directly. Packaging must satisfy:

- **Manifest at Root**: The extracted archive must contain `plugin.json` at its root level (or inside a single folder matching the plugin ID).
- **Path Traversal Protection**: The unpacker strictly verifies relative paths to block Zip Slip attacks (`../` traversals).
- **Capability Preview**: Before unpacking, MicYou parses `plugin.json` and presents requested permissions to the user for confirmation.

### Packaging Command

Use the MicYou CLI to package a plugin project:

```bash
micyou plugin package <plugin-dir> -o plugin.zip
```

The CLI automatically excludes build artifacts (`target/`), Git metadata (`.git/`), and temporary files.

## 4. Official Marketplace Repository

The official MicYou Plugin Marketplace repository maintains metadata and packages:

```text
/
├── index.json                 # Marketplace index (CI generated)
└── plugin/<plugin-id>/
    ├── plugin.json            # Latest plugin manifest
    └── plugin.zip             # Packaged binary archive
```

### Automatic Updates

1. A plugin specifies its `updateUrl` in `plugin.json` pointing to its remote manifest in the marketplace.
2. When the user clicks **Check for Updates**, the host fetches the remote manifest and performs a SemVer comparison.
3. If an update is available, the client downloads `plugin.zip` from the same folder, replaces the installation, and hot-reloads the plugin.
