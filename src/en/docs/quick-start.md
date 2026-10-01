---
title: Quick Start - MicYou Setup Guide
description: MicYou quick start guide. Learn how to stream your phone microphone to your PC over Wi-Fi, Web browser, or USB (ADB), and use it as an audio input in Discord, OBS, Zoom, and games.
keywords: MicYou,phone microphone,PC microphone,Wi-Fi mic,Web mic,ADB connection,virtual audio cable,VB-CABLE,BlackHole,PipeWire,firewall setup
---

# Quick Start

MicYou turns your mobile phone into a high-quality microphone for your computer, supporting Wi-Fi LAN, Web browser, and USB cable connections.

## 1. Preparation

### Step 1: Install MicYou Desktop & Virtual Audio Driver

To enable voice and conferencing apps (like Discord, Zoom, or games) to capture audio from your phone, your PC needs a **virtual microphone driver** to route the stream:

1. **Download & Install MicYou Desktop**: Head to the [Download page](/en/download) to get the installer for your OS (Windows / macOS / Linux).
2. **Install a Virtual Audio Driver**:
   - **Windows**: Download the free **VB-CABLE Driver** from [VB-Audio](https://vb-audio.com/Cable/). Extract the ZIP file, right-click `VBCABLE_Setup_x64.exe` and select "Run as Administrator". Restart your PC after installation.
   - **macOS**: Install BlackHole via Homebrew:
     ```bash
     brew install blackhole-2ch --cask
     ```
     > If macOS blocks the app on first launch, open "System Settings" > "Privacy & Security" and click "Open Anyway".
   - **Linux**: MicYou natively supports **PipeWire** and registers a virtual microphone source automatically. No third-party driver is typically needed.

### Step 2: Prepare Your Mobile Device

Choose either method according to your preference:

- **Mobile App (Recommended)**: Download and install the MicYou Android APK from the [Download page](/en/download). Grant microphone permission upon first launch.
- **Web Mode (Zero-Install)**: No app required. Simply scan a QR code using any modern mobile browser (Chrome, Safari, Edge, Firefox).

## 2. Connection Mode 1: Wi-Fi LAN (Recommended)

Wi-Fi mode requires no cables, sets up in seconds, and is ideal for everyday voice calls, meetings, and streaming.

### Step 1: Connect to Wi-Fi & Configure Firewall

1. **Join the Same Network**: Ensure both your phone and PC are connected to the **same Wi-Fi network** (same router).
2. **Allow Through Firewall (Crucial)**:
   - **First Launch Popup**: When launching MicYou for the first time on Windows, check both **Private Networks** and **Public Networks** and click "Allow access".
   - **Manual Firewall Rules**: If you accidentally dismissed the popup or experience connection timeouts, open PowerShell as Administrator and run:
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux users using `ufw` can run: `sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`

### Step 2: Start Desktop Server

1. Open MicYou on your PC and select **Wi-Fi** mode.
2. The interface displays your PC's local IP (e.g. `192.168.1.100`) and default ports (Control: `6000`, Audio: `6001`).

### Step 3: Connect from Mobile App

1. Open the MicYou App on your phone.
2. Enter the IP address and port shown on your PC, then tap **Connect**.
3. Speak into your phone and check the audio level meter in the MicYou desktop window. If the meter reacts, your wireless mic stream is live!

## 3. Connection Mode 2: Web Browser Mode (No App Needed)

If you are on a borrowed computer or prefer not to install an APK on your phone:

1. Make sure your phone and PC are on the same Wi-Fi network (firewall ports 6000/6001 are shared with Wi-Fi mode).
2. Switch MicYou on your PC to **Web** mode.
3. The desktop app will generate a QR code and a local URL (e.g. `http://192.168.1.100:6000`).
4. Scan the QR code with your phone's camera or browser.
5. Tap **Allow** when the browser requests microphone access. Audio will stream in real time via WebRTC.

## 4. Connection Mode 3: USB Cable / ADB (Ultra-Low Latency)

If you play competitive games requiring ultra-low audio latency, or if your Wi-Fi router has AP isolation enabled:

### Step 1: Enable USB Debugging on Your Phone

1. Go to "Settings" > "About Phone" on your Android device.
2. Tap "Build Number" **7 times** quickly until you see "You are now a developer".
3. Return to "Settings" > "System" / "Developer Options" and turn on **USB Debugging**.

### Step 2: Connect to PC & Grant Authorization

1. Connect your phone to your PC with a USB cable.
2. When the "Allow USB debugging?" prompt appears on your phone screen, check "Always allow from this computer" and tap OK.

### Step 3: Start Streaming

1. Switch both the desktop and mobile MicYou apps to **USB** mode.
2. Click Connect to start streaming audio over USB with minimal latency.

> [!NOTE] ADB Environment
> MicYou Desktop detects and invokes ADB automatically. If your system does not have ADB installed, you can install it via:
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

## 5. Configure Microphone in Voice & Game Apps

Once audio is transmitting, route it to your target application:

1. **Configure MicYou Desktop**:
   - Set MicYou's **Audio Output Device** to the virtual driver's input:
     - **Windows**: `CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**: Default PipeWire virtual node
2. **Configure Voice / Meeting / Game Apps**:
   - Open your app (Discord, Zoom, OBS, Teams, Steam, etc.) and go to Audio/Voice Settings.
   - Set the **Microphone (Input Device)** to:
     - **Windows**: `CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**: `BlackHole 2ch`
     - **Linux**: PipeWire `MicYou` input node
3. Test your mic in the app—your teammates will now hear your mobile phone mic clearly!

## Troubleshooting & Tips

### 1. Wi-Fi mode connection failed or timed out?
- **Firewall Rule**: Ensure Windows Defender Firewall or Linux ufw has unblocked TCP 6000 and UDP 6001 ports.
- **Router AP Isolation**: Public or university Wi-Fi networks often isolate devices from talking to each other. Use a mobile hotspot from your phone or switch to USB mode.

### 2. Level meter is moving, but voice apps have no sound?
- Check device direction: MicYou desktop output must be **`CABLE Input`**, while your voice app microphone input must be **`CABLE Output`**.
- Ensure `CABLE Output` is not muted or set to zero volume in Windows Sound Settings.

### 3. Audio stutters or stops when phone screen turns off?
- Aggressive Android battery management can suspend background network or audio tasks.
- Open Android Settings > Apps > MicYou > Battery, and set it to **"Unrestricted"** (or allow full background activity), and lock the app card in the Recents view.

> [!TIP]
> Running into other issues? Check out the [FAQ](/en/docs/faq) for more detailed troubleshooting steps and solutions.