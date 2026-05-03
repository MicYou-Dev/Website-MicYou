---
title: 快速開始 - MicYou 安裝設定指南
description: MicYou 快速開始指南，詳細介紹如何在 Windows、macOS、Linux 和 Android 上安裝和設定 MicYou，將手機變成電腦麥克風。
keywords: MicYou安裝,MicYou設定,MicYou快速開始,ADB設定,USB偵錯,Wi-Fi連線,藍牙連線
---

# 快速開始

## 1. 下載 ADB

從 [Android Developers](https://developer.android.com/tools/releases/platform-tools?hl=zh_cn) 下載，或使用套件管理工具：

- <Copy text="winget install -e --id Google.PlatformTools" type="info" />
- <Copy text="sudo apt install android-tools-adb" type="info" />
- <Copy text="sudo pacman -S android-tools" type="info" />

其他平台請參考 [官方文檔](https://developer.android.com/tools/releases/platform-tools)

大多數情況下 ADB 會自動加入系統環境變數，如未加入請自行設定。

## 2. 啟用 USB 偵錯

以 OneUI 8 為例：

1. 進入「設定」> 「關於手機」
2. 點選「軟體資訊」，找到「編譯編號」，連點 7 次以啟用開發者選項
3. 返回「設定」> 「開發者選項」，啟用「USB 偵錯」

## 3. 使用 USB 連線

請使用品質穩定的傳輸線，並在桌面端與 Android 應用同時將連線模式切換為 `USB`。

## 4. 使用 Wi‑Fi 連線

請確保 Android 裝置與電腦位於同一網路，並在桌面端與 Android 應用同時切換成 `Wi‑Fi` 模式。

## Android

1. 下載並安裝 APK 到您的 Android 裝置
2. 確保您的裝置與 PC 位於同一網路（Wi-Fi 模式），或透過 USB 連線

## Windows

1. 執行桌面端應用程式
2. 設定連線模式以匹配 Android 應用


## macOS

> [!IMPORTANT]
> 若您使用 Apple Silicon（如 M1/M2）Mac，未啟用 Rosetta 2 時，藍牙模式可能無法正常使用。

為了獲得更佳的使用體驗，建議透過 Homebrew 安裝以下套件：

```bash
brew install blackhole-2ch --cask
brew install switchaudio-osx --formulae
```

> **BlackHole** 為必要軟體（虛擬音訊驅動程式）。若未安裝 Homebrew，可至 https://existential.audio/blackhole/download/ 下載安裝程式。

安裝完成後請重新啟動電腦。

從 [GitHub Releases](https://github.com/LanRhyme/MicYou/releases) 下載並安裝到「應用程式」資料夾。首次開啟可能會被 Gatekeeper 攔截：

- 若顯示「不受信任的開發者」，請至「系統設定」> 「隱私權與安全性」允許應用程式
- 若顯示「應用程式已損毀」，在終端執行：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/MicYou.app
```

執行時需輸入您的使用者帳號密碼，輸入時密碼不可見，完成後回車即可。

## Linux

### 使用預編譯套件（推薦）

預編譯套件可在 [GitHub Releases](https://github.com/LanRhyme/MicYou/releases) 下載。根據您的 Linux 發行版選擇相應的套件。

**DEB 套件（Debian/Ubuntu/Mint 等）：**

```bash
sudo dpkg -i MicYou-*.deb
# 如果缺少依賴：
sudo apt install -f
```

**RPM 套件（Fedora/RHEL/openSUSE 等）：**

```bash
sudo rpm -i MicYou-*.rpm
# 或使用 dnf/yum：
sudo dnf install MicYou-*.rpm
```

**AUR（Arch Linux 及衍生發行版）：**

```bash
git clone https://aur.archlinux.org/micyou-bin.git
cd micyou-bin
makepkg -si
```

或使用 AUR 輔助程式（如 paru）：

```bash
paru -S micyou-bin
```

**執行應用：**

從應用程式選單執行，或在終端執行：

```bash
MicYou
```