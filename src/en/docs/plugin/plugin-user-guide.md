---
title: MicYou Plugin User Guide
description: User guide for installing, managing, configuring, and syncing MicYou plugins across devices.
keywords: MicYou,plugins,user guide,install plugins,soundpad,marketplace,cross-device sync
---

# Plugin User Guide

A complete guide for MicYou users on installing, managing, configuring, and synchronizing plugins.

## Installing Plugins

### From Plugin Marketplace (Recommended)

1. Navigate to **Settings → Plugins** and click **Plugin Marketplace** to browse community and official plugins.
2. Click **Install** on the desired plugin card.
3. Review the permissions and capabilities requested by the plugin and confirm installation.
4. Once installed, the plugin status will change to **Installed** and become immediately available.

### Manual Installation (Offline / Developer Mode)

Plugins are distributed as a directory containing `plugin.json` and entry binaries, or packaged as `.zip` archives:

1. Open the application and go to **Settings → Plugins**.
2. Click **Open Plugin Directory** to open the local storage path:
   - **Linux / macOS**: `~/.config/micyou/plugins/`
   - **Windows**: `%APPDATA%\micyou\plugins\`
3. Place the extracted plugin folder into this directory (each plugin in its own subfolder).
4. Return to the Settings page and click **Refresh**.

> **Note**: When importing ZIP packages, the system displays a capability preview before unpacking.

## Uninstalling Plugins

- Click the trash can icon on the plugin card to disable and delete the plugin files.
- Alternatively, delete the plugin folder directly from your operating system's plugin directory and refresh.

## Managing Plugins in GUI

| Action | Description |
| --- | --- |
| **Enable / Disable** | Toggle switch on the right side of the card (instantly hooks into DSP chain) |
| **Uninstall** | Remove plugin and clean up local files |
| **View Logs** | View isolated ring buffer logs (up to 500 lines) |
| **Edit Config** | Open JSON configuration editor and save to disk |
| **Cross-Device Status** | Check sync status with mobile client |

## Custom Settings Panels

Plugins that declare `ui.panels` will dynamically add custom panels in the Settings dialog. Panels run inside a sandboxed iframe with full host communication support.

## Global Hotkeys

Plugins with global hotkey support (such as Soundpad) can trigger actions even when games or full-screen applications are focused.

## Soundpad Plugins

- When a Soundpad plugin is enabled, an interactive audio grid appears on the main interface.
- Clicking a button plays audio mixed directly into the virtual microphone stream so both you and voice call participants hear it.
- Audio file mappings can be configured directly in plugin settings.

## Updating Plugins

If a plugin declares an `updateUrl` in its manifest, click **Check for Updates** on the card to download and hot-reload newer releases.

## Configuring Parameters

1. Open the plugin panel and click the gear/config icon.
2. Edit the JSON configuration:

```json
{ "gain": 2.0, "threshold": -40.0 }
```

3. Click **Save** to apply changes immediately.

## Cross-Device Synchronization

When your Android device connects to the desktop app:

- Phone and desktop plugins communicate seamlessly using `PluginMessage` protobuf frames.
- Desktop plugins can route messages to `remote` targets (e.g. mobile sensor modules).
- Sensor telemetry captured on mobile can be processed on PC in real time.
