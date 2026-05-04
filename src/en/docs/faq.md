---
title: FAQ - MicYou Troubleshooting
description: MicYou frequently asked questions including device connection issues, firewall settings, ADB configuration, and audio output troubleshooting.
keywords: MicYou FAQ,MicYou troubleshooting,MicYou cannot connect,firewall settings,ADB issues,audio issues
---

# FAQ

## Cannot connect to device

### Wi-Fi Mode

1. **Check Firewall Settings**

   Windows Firewall may block inbound connections. Please follow these steps to manually allow the ports:

   1. Press `Win+R`, type `powershell`, then hold `Ctrl+Shift` and click "OK" to run PowerShell as administrator.
   2. Enter the following commands:

      ```powershell
      New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
      New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
      ```

      > MicYou uses TCP port `6000` (control) and UDP port `6001` (audio data) by default. Change the port numbers if you have configured a different port.

      If no error appears, the operation was successful. Try connecting again.

2. **Check if devices are on the same subnet**

   - Ensure the Android phone and PC are connected to the **same** Wi-Fi router.
   - Ensure that **AP Isolation** or **Network Device Isolation** features are disabled in router settings (refer to your router's manual).

> [!TIP]
> Advanced users can try using tools like Nmap or ping to check connectivity.

### USB (ADB) Mode

1. **Enable Developer Options**

   > The steps below may vary depending on your device. **Please use a search engine** to find instructions for your specific device.

   - Find "About phone" in phone settings, tap "Build number" 7 times to enable Developer Options.
   - Enter Developer Options and enable **USB debugging**.

2. **Confirm ADB connection**

   > ADB tools must be installed on the computer (see Step 1: Download ADB above).

   Run the following command to verify that one and only one device is connected:

   ```bash
   adb devices
   ```

   If multiple devices are listed, specify the target device for port forwarding:

   ```bash
   adb -s <device_serial_number> reverse tcp:6000 tcp:6000
   ```

   > The device serial number can be found in the output of `adb devices`.

## No audio output after connecting

Please ensure that the VB-Audio driver is correctly installed and that the following devices are **not disabled**:

- **Output Device**: CABLE Input (VB-Audio Virtual Cable)
- **Input Device**: CABLE Output (VB-Audio Virtual Cable)

To check: Open Settings > Sound, and verify both devices are **Enabled**:

![Input device](/input-device.png)

![Output device](/output-device.png)