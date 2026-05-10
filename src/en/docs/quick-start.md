---
title: Quick Start - MicYou Installation Guide
description: MicYou quick start guide with detailed instructions on how to install and configure MicYou on Windows, macOS, Linux, and Android to turn your phone into a PC microphone.
keywords: MicYou install,MicYou setup,MicYou quick start,ADB setup,USB debugging,Wi-Fi connection
---

# Quick Start

## 1. Download ADB

Download from [Android Developers](https://developer.android.com/tools/releases/platform-tools?hl=zh_cn), or install via package manager:

- <Copy text="winget install -e --id Google.PlatformTools" type="info" />
- <Copy text="sudo apt install android-tools-adb" type="info" />
- <Copy text="sudo pacman -S android-tools" type="info" />

Other platforms, please refer to [official documentation](https://developer.android.com/tools/releases/platform-tools)

### Add ADB to Environment Variables

After downloading and extracting, you need to add the ADB directory to your system's `PATH` environment variable so that the `adb` command is available in the terminal.

**Windows:**

1. Press `Win+R`, type `sysdm.cpl` and press Enter to open System Properties
2. Go to the "Advanced" tab and click "Environment Variables"
3. Under "System variables", find the `Path` variable, select it, and click "Edit"
4. Click "New" and enter the full path of the extracted ADB directory (e.g., `C:\platform-tools`)
5. Click "OK" to close all dialogs
6. Reopen the terminal and run `adb --version` to verify the configuration

> If you installed via <Copy text="winget install -e --id Google.PlatformTools" type="info" />, ADB is added to `PATH` automatically — no manual configuration is needed.

**macOS / Linux:**

If installed via a package manager, ADB is usually already in your `PATH`. If you extracted it manually, add the following line to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
export PATH=$PATH:/path/to/platform-tools
```

Then run `source ~/.zshrc` (or the corresponding config file) to apply the changes, and verify with `adb --version`.

## 2. Enable USB Debugging

Using OneUI 8 as an example:

1. Go to Settings > About phone
2. Tap Software information, find Build number and tap it 7 times to enable Developer Options
3. Go back to Settings > Developer options, and enable USB debugging

## 3. USB connection

Use a **stable** data cable, and set the connection mode to `USB` on **both** the desktop app and the Android app.

## 4. Wi-Fi connection

Ensure your Android device and PC are on the **same network**, and set the connection mode to `Wi-Fi` on **both** the desktop app and the Android app.

## Android

1. Download and install the APK on your Android device.
2. Ensure your device is on the same network as your PC (for Wi-Fi) or connected via USB.

## Windows

1. Run the desktop application.
2. Configure the connection mode to match the Android app.

## macOS

For the best experience, install the following dependencies via Homebrew:

```bash
brew install blackhole-2ch --cask
brew install switchaudio-osx --formulae
```

> **BlackHole** is required (virtual audio driver). If you do not have Homebrew, go to https://existential.audio/blackhole/download/ to download the installer.

Please restart your Mac after installation.

After downloading the app from [GitHub Releases](https://github.com/LanRhyme/MicYou/releases) and installing it in your Applications folder, Gatekeeper may block it during first use:

- If prompted with "Untrusted Developer," navigate to **System Settings/System Preferences > Privacy & Security** to allow the app to run.
- If prompted with "The application is damaged," execute the following command:

```bash
sudo xattr -r -d com.apple.quarantine /Applications/MicYou.app
```

You will need to enter your account password during the process. The password will be hidden while you are entering it. Press Enter after you have finished entering it.

## Linux

### Using pre-built packages (recommended)

Pre-built packages are available in [GitHub Releases](https://github.com/LanRhyme/MicYou/releases). Choose the appropriate package for your Linux distribution.

**DEB package (Debian/Ubuntu/Mint etc.):**

```bash
sudo dpkg -i MicYou-*.deb
# If dependencies are missing:
sudo apt install -f
```

**RPM package (Fedora/RHEL/openSUSE etc.):**

```bash
sudo rpm -i MicYou-*.rpm
# Or use dnf/yum:
sudo dnf install MicYou-*.rpm
```

**AUR (Arch Linux and derivatives):**

```bash
git clone https://aur.archlinux.org/micyou-bin.git
cd micyou-bin
makepkg -si
```

Or use an AUR helper like paru:

```bash
paru -S micyou-bin
```

**Run the application:**

From the application menu, or run from terminal:

```bash
MicYou
```