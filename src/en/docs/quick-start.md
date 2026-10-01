---
title: Quick Start - MicYou
description: Get started with MicYou. Stream your mobile microphone to your computer over Wi-Fi, USB, or Web with low latency, and use it in Discord, OBS, Zoom, and games.
keywords: MicYou,phone microphone,PC microphone,Wi-Fi mic,Web mic,ADB connection,virtual audio cable,VB-CABLE,BlackHole,PipeWire,firewall setup
---

# Quick Start

Turn your phone into a high-quality PC microphone in just a few simple steps.

## 1. Prerequisites

### Step 1: Install Desktop App & Virtual Audio Driver

Your computer's voice apps (Discord, Zoom, games, etc.) receive the incoming stream through a **virtual audio driver**:

1. **Download & Install MicYou Desktop**: Grab the installer for your OS from the [Download page](/en/download) (Windows / macOS / Linux).
2. **Install a Virtual Audio Driver**:
   - **Windows**: Download the free **VB-CABLE Driver** from the [VB-Audio website](https://vb-audio.com/Cable/). Extract the ZIP, right-click `VBCABLE_Setup_x64.exe` and choose "Run as administrator". **Restart your PC after installation**.
   - **macOS**: Install the open-source BlackHole driver via Homebrew:
     ```bash
     brew install blackhole-2ch --cask
     ```
     > If macOS blocks the app on first launch, open "System Settings" > "Privacy & Security" and click "Open Anyway".
   - **Linux**: MicYou natively supports **PipeWire** and creates virtual audio input nodes automatically. No additional driver is required.

### Step 2: Prepare Your Mobile Device

Pick whichever method suits your setup:

- **Mobile App (Recommended)**: Download the MicYou Android APK from the [Download page](/en/download). Grant microphone permissions on first open.
- **Web Browser (Zero-Install)**: No app needed—simply scan a QR code in your mobile browser (great for quick use on a friend's PC).

## 2. Connect Your Devices

### Option A: Wi-Fi LAN (Wireless & Easy)

No cables needed, instant setup—perfect for casual calls, meetings, and streaming.

1. **Connect to Same Network**: Make sure your phone and PC are connected to the same Wi-Fi router.
2. **Allow Firewall Access**:
   - On Windows, check both "Private Networks" and "Public Networks" when the firewall prompt appears.
   - If previously cancelled or if connections time out, open PowerShell as Administrator and run:
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux users using `ufw`: `sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`
3. **Connect**:
   - Open MicYou on your PC, select **Wi-Fi** mode, and note the local IP and port displayed.
   - Open the MicYou App on your phone, enter the IP and port, and tap "Connect".
   - Speak into your phone and watch the volume meter bounce on your PC—you're live!

### Option B: USB Cable / ADB (Ultra-Low Latency)

Immune to Wi-Fi jitter with steady sub-10ms latency. Ideal for competitive gaming or restricted networks (campus Wi-Fi with AP isolation).

1. **Enable USB Debugging**:
   - On your phone, go to "Settings" > "About phone" and tap "Build number" **7 times** to unlock Developer Options.
   - Go to "Settings" > "System / Developer options" and enable **USB Debugging**.
2. **Connect & Authorize**:
   - Plug your phone into your PC via USB cable.
   - When the "Allow USB debugging?" dialog appears on your phone, check "Always allow" and tap OK.
3. **Start Streaming**:
   - Switch both PC and mobile MicYou apps to **USB** mode and click Connect.

> [!NOTE] ADB Environment
> MicYou Desktop detects and runs ADB automatically. If ADB is missing from your system, install it via your package manager:
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

### Option C: Web Browser Mode (No Installation)

No APK installation required—ideal when using a shared or temporary computer.

1. Ensure your phone and PC are on the same Wi-Fi network.
2. Switch MicYou on your PC to **Web** mode to display a QR code and local URL.
3. Scan the QR code using your phone's camera or modern browser (Chrome, Safari, Edge, etc.).
4. Tap **"Allow"** when prompted for microphone access. Audio streams in real-time to your PC via WebRTC.

## 3. Select Microphone in Voice & Game Apps

Once streaming is active, select the virtual microphone driver in your target software:

1. **Check MicYou Desktop Output Device**:
   - Set **Audio Output Device** to the virtual driver input:
     - **Windows**: `CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**: `BlackHole 2ch`
     - **Linux**: Default PipeWire virtual output node
2. **Set Input in Your Voice / Meeting App**:
   - Open audio settings in your app (Discord, Zoom, OBS, Teams, Steam Voice, etc.).
   - Set the **Microphone (Audio Input)** to:
     - **Windows**: `CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**: `BlackHole 2ch`
     - **Linux**: PipeWire `MicYou` virtual source
3. Speak into your phone—your apps will now capture clean, low-latency audio directly from your phone!

## 4. Quick Troubleshooting & Tips

- **Wi-Fi connection fails or times out?**  
  Confirm Windows Firewall or Linux ufw has unblocked TCP 6000 and UDP 6001. Public or school networks often enable "AP Isolation" to block local device communication—switch to USB mode or use a mobile hotspot.
- **Level meter moves, but no sound in voice apps?**  
  Double check routing directions: MicYou Desktop outputs to **`CABLE Input`**, while Discord/voice apps must listen to **`CABLE Output`**.
- **Audio cuts off when phone screen turns off?**  
  Android aggressive battery savers freeze background network and microphone tasks. Go to "Settings" > "Apps" > "MicYou" > "Battery" and set it to **"Unrestricted"**, then lock MicYou in your recent apps overview.

> [!TIP]
> Running into other issues? Check the [FAQ](/en/docs/faq) for comprehensive troubleshooting guides.