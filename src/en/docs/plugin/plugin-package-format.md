---
title: MicYou Plugin Package Format
description: Plugin directory layout, zip packaging, marketplace repo and the update flow
keywords: MicYou,plugin package,zip,marketplace,update
---

# MicYou Plugin Package Format

## Directory layout

```text
<plugin-id>/
├── plugin.json      # manifest (required)
├── <entry>          # entry artifact: .so/.dylib/.dll (native) or .wasm
└── panel.html       # optional settings/window page (ui.panels.entry)
```

Installed to `~/.config/micyou/plugins/<id>/` (Linux) or
`%APPDATA%\micyou\plugins\<id>\` (Windows)

## plugin.json

Required: `id` (reverse-DNS), `name`, `version` (semver), `runtime` (wasm|native), `entry`

Common optional fields: `author`, `license`, `homepage`, `repository`,
`capabilities`, `kind`, `dsp`, `ui`, `config`, `configSchema`, `dependencies`,
`updateUrl`, `arches`, `nameI18n`, `descriptionI18n`

## zip packaging

- must contain `plugin.json` (nested folders allowed, prefix stripped on install)
- permission preview shown before extraction
- zip-slip protection on extract
- build with: `micyou plugin package <dir> -o plugin.zip`

## Marketplace

Official repo: https://github.com/MicYou-Dev/MicYou-Plugins

```text
/
├── index.json                 # plugin catalog (auto-generated)
└── plugin/<plugin-id>/
    ├── plugin.json            # manifest (updateUrl points to this repo)
    └── plugin.zip             # package artifact
```

Update flow: `updateUrl` points at the marketplace manifest, the app
compares semver on "Check updates", and downloads the sibling `plugin.zip`
to replace the install
