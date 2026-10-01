---
title: FAQ - MicYou
description: Frequently asked questions and troubleshooting guide for MicYou. Covers Wi-Fi, USB, and Web connection issues, audio routing, background keep-alive, latency optimization, and OS-specific fixes.
keywords: MicYou FAQ,MicYou troubleshooting,cannot connect,no sound,audio routing,noise suppression,latency,background battery,VB-CABLE,BlackHole,PipeWire
---

# Frequently Asked Questions (FAQ)

Running into issues while using MicYou? Here is a practical troubleshooting guide covering the most common questions.

## 1. Connection & Network Issues

### Phone shows "Connection timed out" or fails to connect in Wi-Fi mode

Wi-Fi mode requires your phone and computer to communicate over your local area network (LAN). Please verify the following three items:

1. **Allow Firewall Ports on Your Computer (Most Common)**  
   Windows Defender Firewall or third-party antivirus software often silently blocks incoming local connections. MicYou uses **TCP 6000** (control channel) and **UDP 6001** (audio data).
   - **Windows**: Open PowerShell as Administrator and run:
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
   - **Linux** (if `ufw` is active):
     ```bash
     sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp
     ```

2. **Check Router AP Isolation / Guest Network**  
   - Make sure your phone and PC are connected to the same Wi-Fi router.
   - On **campus networks, company public Wi-Fi, or shared apartment networks**, routers frequently have **AP Isolation (Client Isolation)** turned on, preventing devices from talking to each other.
   - **Solution**: Enable a personal hotspot on your phone and connect your PC to it, or switch directly to [USB Cable Mode](/en/docs/quick-start#option-b-usb-cable-adb-ultra-low-latency).

3. **Wrong Network Adapter IP Selected**  
   If your computer has WSL, virtual machines (VMware / VirtualBox), VPNs, or mesh networks (Tailscale / ZeroTier) enabled, MicYou Desktop may detect multiple virtual IP addresses.  
   - In MicYou Desktop's IP dropdown, select your PC's **physical Wi-Fi network IP** (usually `192.168.x.x` or `10.x.x.x`), and make sure the phone connects to that matching address.

### USB (ADB) Mode says "No device detected" or connection fails

USB mode utilizes local ADB port tunneling for rock-solid stability and minimum latency. If your phone is not recognized:

1. **Enable USB Debugging & Grant Authorization**  
   - Go to "Settings" > "About phone" and tap "Build number" 7 times to unlock Developer Options.
   - Open "Developer options" and turn on **USB Debugging**.
   - Connect via USB cable. When the **"Allow USB debugging?"** prompt appears on your phone screen, check "Always allow from this computer" and tap OK.

2. **Change USB Mode from "Charging Only"**  
   After plugging in the cable, pull down your phone notification shade and change the USB mode to **"File Transfer (MTP)"** or **"PTP"**. Some phone brands disable ADB debugging interfaces when set to "Charging only".

3. **Verify ADB Environment**  
   MicYou Desktop contains built-in ADB invocation logic. You can check the connection status in your terminal:
   ```bash
   adb devices
   ```
   - If it lists `unauthorized`: Unlock your phone and accept the USB debugging prompt.
   - If `adb` is not recognized, install platform tools via:
     - **Windows**: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
     - **macOS**: <Copy text="brew install android-platform-tools" type="info" />
     - **Ubuntu / Debian**: <Copy text="sudo apt install android-tools-adb" type="info" />
     - **Arch Linux**: <Copy text="sudo pacman -S android-tools" type="info" />

### Web Mode fails to open or cannot record audio

1. **Browser cannot open the URL**: Ensure both devices are on the same Wi-Fi and that the PC firewall allows inbound connections on the generated Web port.
2. **Page loads but no audio is transmitted**:
   - When loading the page, you must tap **"Allow"** when the browser requests microphone permissions.
   - Use standard modern browsers (Chrome, Safari, Edge, Firefox). Avoid in-app WebViews (like WeChat's built-in scanner); open the link directly in your system browser instead.

## 2. Audio Routing & Sound Output

### Connected and volume meter is bouncing, but no sound in Discord, games, or meetings?

This is the most common configuration issue: **swapping audio input and output directions**.

::: tip Core Concept: Understanding Audio Routing
- **MicYou Desktop** is the audio **sender** — it sends received phone audio **OUT** to the virtual audio cable.
- **Third-party software (Discord / Zoom / OBS / Game Voice)** is the audio **receiver** — it captures sound **IN** from the virtual audio cable as a microphone.
:::

#### Verification Steps:

1. **Check MicYou Desktop's "Audio Output Device"**:
   - **Windows**: Select `CABLE Input (VB-Audio Virtual Cable)`
   - **macOS**: Select `BlackHole 2ch`
   - **Linux**: Select default PipeWire virtual sink

2. **Check third-party software's "Microphone / Input Device"**:
   - **Windows**: Select `CABLE Output (VB-Audio Virtual Cable)`
   - **macOS**: Select `BlackHole 2ch`
   - **Linux**: Select the PipeWire `MicYou` virtual source

3. **Check System Recording Levels**:  
   Open your operating system's sound control panel and ensure `CABLE Output` or `BlackHole` is not muted and the input volume is set to 80%~100%.

**Windows Sound Device Configuration:**

![Input Device](/input-device.png)

![Output Device](/output-device.png)

**macOS Sound Input Configuration:**

![macOS Input Device](/macos-sound-en.png)

### Volume is too low, background noise is loud, or hearing feedback / screeching?

1. **Low Volume**:
   - Increase microphone input gain in the MicYou mobile app.
   - In Windows "Sound Settings" > "More sound settings" > "Recording" > double-click `CABLE Output` > "Levels", turn the volume up to 100.
2. **Feedback Screeching / Echo**:
   - Screeching happens when computer speakers play incoming audio and the mobile phone microphone picks it up again in a feedback loop.
   - **Solution**: Use headphones to listen to PC audio, or enable **AEC (Acoustic Echo Cancellation)** and **PureVox Noise Suppression** in MicYou settings.
3. **High Background Noise**:
   - Enable **PureVox AI Noise Suppression** or Voice Activity Detection (VAD) in MicYou Desktop to filter out keyboard clatter, fan noise, and ambient hiss.

### Audio crackling, popping, or distorted sound?

1. **Sample Rate Mismatch (Windows)**:
   - Open Windows Sound Control Panel (`mmsys.cpl`).
   - Under `CABLE Input` (Playback tab) and `CABLE Output` (Recording tab) > "Properties" > "Advanced", set "Default Format" on both to **`2 channel, 16 bit, 48000 Hz`** (or `24 bit, 48000 Hz`).
2. **Wi-Fi Network Jitter**:
   - Increase the Audio Buffer Size in MicYou Desktop settings.
   - Switch your mobile device to 5GHz Wi-Fi to avoid 2.4GHz Bluetooth and microwave congestion.

### Built-in mic or headphones stopped working after quitting MicYou?

- **macOS**: macOS may leave the default system input set to BlackHole. If `switchaudio-osx` is not installed or MicYou exited unexpectedly, open "System Settings" > "Sound" > "Input" and manually re-select your built-in microphone or headset.
- **Windows**: Check your voice chat app (e.g. Discord) to ensure the input device is set to "Default Communication Device" or your physical headset rather than permanently locked to `CABLE Output`.

## 3. Latency Optimization & Background Keep-Alive

### Sound drops or disconnects after phone screen turns off or app goes to background?

Android's aggressive battery-saving features suspend background network sockets and microphone capture when the screen is locked.

To ensure uninterrupted streaming:

1. **Disable Battery Optimization (Crucial)**:
   - Go to "Settings" > "Apps" > "MicYou" > "Battery / Battery Usage".
   - Set it to **"Unrestricted"** (or "Don't optimize / Allow background activity").
2. **Lock MicYou in the App Switcher**:
   - Open the Recent Apps / Multitasking overview on your phone.
   - Long-press or swipe down on the MicYou preview card, then tap the **Lock** icon to prevent task cleaner termination.
3. **Allow Foreground Notification**:
   - Keep the persistent foreground service notification enabled. Android requires this notification to protect long-running audio capture services from being killed.

### How to achieve the lowest possible latency for competitive gaming?

1. **Use USB Cable Mode**: USB transmission avoids wireless jitter completely, providing rock-solid sub-10ms latency.
2. **Wi-Fi Mode Tuning**:
   - Connect your PC to your router via Ethernet cable, and connect your phone to 5GHz Wi-Fi.
   - If the network connection is stable, reduce the Audio Buffer Size in MicYou settings to achieve lower latency.

## 4. Operating System Specific Fixes

### Windows: VB-CABLE driver not detected after installation

- When installing, extract the downloaded ZIP and right-click `VBCABLE_Setup_x64.exe`, then choose **"Run as administrator"**.
- You **must restart your computer** after installation for the driver to register with Windows Audio services.

### macOS: "Cannot be opened because the developer cannot be verified"

- If Gatekeeper blocks the app on first launch, open "System Settings" > "Privacy & Security", scroll to the bottom, and click **"Open Anyway"**.
- Under "Privacy & Security" > "Microphone", verify that MicYou is granted access.

### Linux: Desktop app shows a blank, transparent, or black window

On certain Linux environments (especially with proprietary NVIDIA drivers or specific WebKitGTK versions), DMA-BUF hardware acceleration can cause window rendering glitches.

Launch the app with software rendering fallback:
```bash
MicYou --software-rendering
```

Or disable DMA-BUF acceleration via environment variable:
```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
MicYou
```

### Linux: PipeWire does not show the virtual microphone node

MicYou provides native PipeWire integration. If the virtual source does not appear, check your user-level audio daemon status:
```bash
systemctl --user status pipewire pipewire-pulse
```

## 5. Plugins & Legacy Device Compatibility

### Plugin fails to load or audio starts crackling after enabling a plugin?

1. **Plugin failed to load**: Verify that the plugin binary matches your operating system and CPU architecture (x86_64 / arm64 / WASM), and that the declared `apiVersion` in `plugin.json` matches your MicYou host version.
2. **Audio distortion / stutter**: Real-time DSP plugins must avoid heavy blocking I/O or heap allocations on the audio processing thread. Disable the plugin under "Settings" > "Plugins" and inspect its logs using the "View Logs" button.

### Can I turn an old Android 5.0 / 6.0 phone into a microphone?

Yes! While official release builds target Android 7.0+ (API 24+), the project includes a dedicated compatibility build pipeline for Android 5.0+ (API 21+) legacy devices.

You can download the compatibility APK from our download page or build it yourself by following the [Android Compatibility Build Guide](/en/docs/android-compat).