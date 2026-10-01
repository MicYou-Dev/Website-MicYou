---
title: FAQ - MicYou Troubleshooting
description: Frequently asked questions for MicYou, covering connection issues, firewall configurations, ADB debugging, audio routing, and Linux rendering solutions.
keywords: MicYou FAQ,MicYou troubleshooting,cannot connect,firewall settings,ADB issues,audio routing,PipeWire,software rendering
---

# FAQ

## Cannot Connect Device

### Wi-Fi Mode

1. **Check Firewall Rules**

   Windows Firewall may block inbound traffic. You can allow the ports manually via PowerShell:

   1. Press `Win+R`, type `powershell`, hold `Ctrl+Shift`, and hit Enter to run as Administrator.
   2. Run the following commands:

      ```powershell
      New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
      New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
      ```

      > MicYou defaults to TCP port `6000` (control channel) and UDP port `6001` (audio stream). If you modified ports in settings, replace them with your custom values.

2. **Check Subnet Connectivity**

   - Verify that your phone and PC are connected to the **same Wi-Fi network**.
   - Make sure your router's **AP Isolation** or **Client Isolation** feature is turned off.

> [!TIP]
> Advanced users can run ping or nmap to verify end-to-end IP reachability.

### USB (ADB) Mode

1. **Enable Developer Options & USB Debugging**

   - Open Settings > About Phone, tap "Build number" 7 times.
   - Return to Developer Options and toggle **USB Debugging** on.

2. **Verify ADB Connection**

   Run:

   ```bash
   adb devices
   ```

   If multiple devices are connected, forward the port specifically:

   ```bash
   adb -s <device-serial> reverse tcp:6000 tcp:6000
   ```

### Web Mode

1. **Page Fails to Load**: Ensure your mobile device and PC are on the same Wi-Fi and that the PC firewall allows inbound connections on the generated Web port.
2. **Microphone Access**: Ensure you are using a modern browser with WebRTC support (e.g. Chrome, Safari, Edge, Firefox) and grant microphone permission when prompted.

## No Sound Output After Connecting

### Windows

Verify that VB-CABLE is installed and that the following devices are **enabled**:

- **Output device**: CABLE Input (VB-Audio Virtual Cable)
- **Input device**: CABLE Output (VB-Audio Virtual Cable)

Check via Windows Settings > Sound:

![Input Device](/input-device.png)

![Output Device](/output-device.png)

### macOS

Ensure BlackHole is installed:

If `switchaudio-osx` is not installed, manually switch your microphone in System Settings > Sound > Input to BlackHole.

![macOS Input Device](/macos-sound-en.png)

### Linux (PipeWire)

MicYou features native PipeWire routing. If the virtual source does not appear, ensure PipeWire user services are running:

```bash
systemctl --user status pipewire pipewire-pulse
```

## Built-in Mic Not Working After Quitting

### macOS

If `switchaudio-osx` is not installed or the application exited abnormally, your default input device might remain set to BlackHole.

Open System Settings > Sound > Input and select your built-in microphone (e.g., "MacBook Pro Microphone").

## Linux Client Blank Screen or Transparent Window

On certain Linux environments (especially with NVIDIA drivers or specific WebKitGTK versions), hardware DMA-BUF acceleration can cause a blank or transparent window.

Launch the app with software rendering fallback:

```bash
MicYou --software-rendering
```

Alternatively, set the environment variable:

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
MicYou
```