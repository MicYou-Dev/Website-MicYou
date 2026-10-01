---
title: Plugin User Guide - MicYou
description: How to install, configure, and manage MicYou plugins, use soundboard hotkeys, and sync data across devices.
keywords: MicYou,plugins,user guide,install plugins,soundpad,marketplace,cross-device sync
---

# Plugin User Guide

Learn how to discover, install, configure, and manage plugins in MicYou, as well as how to use the built-in soundboard and cross-device sync.

## Installing Plugins

### Method 1: From the Plugin Marketplace (Recommended)

1. Open MicYou Desktop and go to **Settings → Plugins**.
2. Click **Plugin Marketplace** to explore available official and community plugins.
3. Click **Install** on your chosen plugin card.
4. Review the requested permissions and capability list, then confirm installation.

### Method 2: Manual Installation (Offline / Developer Mode)

Plugins can also be installed manually via local directories or `.zip` packages:

1. Open **Settings → Plugins**.
2. Click **Open Plugin Directory** to locate the local storage path:
   - **Windows**: `%APPDATA%\micyou\plugins\`
   - **macOS / Linux**: `~/.config/micyou/plugins/`
3. Place the extracted plugin folder inside this directory (each plugin should reside in its own folder named after its plugin ID).
4. Return to Settings and click **Refresh**.

> [!NOTE] Permission Authorization
> Whether downloaded from the marketplace or imported manually from a ZIP file, MicYou displays a capability checklist (such as real-time audio access or network access) for user authorization before the plugin is loaded.

## Managing & Configuring Plugins

From the plugin management panel, you can perform the following actions:

- **Enable / Disable**: Toggle the switch on the plugin card. When enabled, active DSP nodes connect immediately into the live audio chain.
- **Configure Parameters**: Click the gear/settings icon on the card:
  - If the plugin provides a declarative schema (`configSchema`), modify parameters using native sliders, toggles, and dropdowns.
  - Otherwise, edit the raw JSON configuration directly in the embedded editor.
- **View Logs**: Inspect isolated console logs for the plugin (stored in an in-memory ring buffer of the latest 500 lines) for easy debugging.
- **Check for Updates**: If online updates are supported, click **Check for Updates** to upgrade to the latest release seamlessly.
- **Uninstall**: Click the trash icon to disable and delete the plugin files from disk.

## Custom Settings Panels

Plugins with complex user interfaces (`ui.panels`) dynamically append custom views to the Settings sidebar. These panels run in a sandboxed iframe with secure two-way host communication.

## Soundboard (Soundpad) Features

When a soundboard plugin is enabled, an interactive button grid appears on the main interface:

- Click a sound button or trigger its bound global hotkey to play the audio.
- Audio plays directly into the virtual microphone stream, so both you and your call participants hear it simultaneously.
- Audio file mappings can be customized in the plugin settings.

## Global Hotkeys

Plugins with hotkey support can capture key combinations even while backgrounded or during full-screen gaming (e.g. quick mute, instant soundboard triggers).

> [!NOTE] Linux Desktop Sessions
> Global hotkeys are supported natively on Windows, macOS, and Linux X11 sessions. Under Wayland sessions, due to compositor security isolation, please use the on-screen UI buttons instead.

## Cross-Device Sync (PC ↔ Mobile)

When your phone connects to MicYou Desktop, the plugin message bus automatically links both ends:

- Sensor data captured on mobile (e.g. motion, battery level) streams in real time to desktop plugins for processing.
- Desktop plugins can send control messages back to the phone.
- Cross-device sync status is displayed in the upper-right corner of the plugin panel.

## Troubleshooting

### Plugin failed to load?
- Ensure the plugin binary matches your operating system and CPU architecture (x86_64, arm64, etc.).
- Verify that the `apiVersion` in `plugin.json` matches your MicYou host version.

### Audio crackles or stutters after enabling a DSP plugin?
- Real-time audio processing has strict timing budgets. If a DSP plugin performs blocking file I/O or heavy memory allocations on the audio thread, audio frames will be dropped. Disable the plugin and check its logs for performance bottlenecks.
