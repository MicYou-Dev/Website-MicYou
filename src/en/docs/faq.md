## FAQ

### Cannot connect to device

#### Wi-Fi Mode

1. **Check Firewall Settings**

   Windows may block inbound connections. Please follow these steps to manually allow the port:

   1. Press `Win+R`, type `cmd`, then hold `Ctrl+Shift` and click "OK" to run Command Prompt as administrator.
   2. Enter the following command:

      ```cmd
      netsh advfirewall firewall add rule name="Allow 6666" dir=in action=allow protocol=TCP localport=6000
      ```

      > MicYou uses port `6000` by default for connection; you can change it if needed.

      If no message appears, the operation was successful. Try connecting again.

2. **Check if devices are on the same subnet**

   - Ensure the Android phone and PC are connected to the **same** Wi-Fi router.
   - Ensure that **AP Isolation** or **Network Device Isolation** features are disabled in router settings (refer to your router's manual).

> [!TIP]
> Advanced users can try using tools like Nmap or ping to check connectivity.

#### USB (ADB) Mode

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

### No audio output after connecting

Please ensure that the VB-Audio driver is correctly installed and that the following devices are **not disabled**:

- **Output Device**: CABLE Input (VB-Audio Virtual Cable)
- **Input Device**: CABLE Output (VB-Audio Virtual Cable)

To check: Open Settings > Sound, and verify both devices are **Enabled**:

![Input device](https://github.com/user-attachments/assets/1cf5f97f-1647-4fb0-a152-85be2697df39)

![Output device](https://github.com/user-attachments/assets/9e9ef42d-186f-42a6-ba4d-7b1a3815f860)