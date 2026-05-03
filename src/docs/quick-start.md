---
title: 快速开始 - MicYou 安装配置指南
description: MicYou 快速开始指南，详细介绍如何在 Windows、macOS、Linux 和 Android 上安装和配置 MicYou，将手机变成电脑麦克风。
keywords: MicYou安装,MicYou配置,MicYou快速开始,ADB配置,USB调试,Wi-Fi连接,蓝牙连接
---

# 快速开始

## 1. 下载 ADB

从 [Android Developers](https://developer.android.com/tools/releases/platform-tools?hl=zh_cn) 下载，或使用系统包管理器：

- <Copy text="winget install -e --id Google.PlatformTools" type="info" />
- <Copy text="sudo apt install android-tools-adb" type="info" />
- <Copy text="sudo pacman -S android-tools" type="info" />

其他平台请参考 [官方文档](https://developer.android.com/tools/releases/platform-tools)

## 2. 启用 USB 调试

以 OneUI 8 为例：

1. 进入「设置」> 「关于手机」
2. 点击「软件信息」，找到「编译编号」，点击 7 次以启用开发者选项
3. 返回「设置」> 「开发者选项」，启用「USB 调试」

## 3. 使用 USB 连接

请使用稳定的数据线，并确保桌面端和 Android 客户端都将连接模式切换为 `USB`。

## 4. 使用 Wi-Fi 连接

请确保 Android 设备与 PC 处于同一网络环境，并且桌面端和 Android 客户端都将连接模式切换为 `Wi-Fi`。

## Android

1. 下载并安装 APK 到您的 Android 设备
2. 确保您的设备与 PC 处于同一网络（Wi-Fi 模式），或通过 USB 连接

## Windows

1. 运行桌面端应用程序
2. 配置连接模式以匹配 Android 应用

## macOS

> [!IMPORTANT]
> 如果您使用的是 Apple Silicon Mac，未启用 Rosetta 2 时，蓝牙模式可能无法正常使用。

为了获得更好的使用体验，建议通过 Homebrew 安装以下依赖：

```bash
brew install blackhole-2ch --cask
brew install switchaudio-osx --formulae
```

> **BlackHole** 必须安装（虚拟音频驱动）。若未安装 Homebrew，请前往 https://existential.audio/blackhole/download/ 下载安装程序并安装。

完成后请重启您的 Mac。

在 [GitHub Releases](https://github.com/LanRhyme/MicYou/releases) 下载应用并安装到“应用程序”目录后，首次启动可能会被 Gatekeeper 拦截。

- 若提示「不受信任的开发者」，请前往 **「系统设置」/「系统偏好设置」 > 「隐私与安全」** 允许应用运行。
- 若提示「应用已损坏」，请在终端执行：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/MicYou.app
```

执行时需要输入您的用户账号密码，输入时密码不可见，完成后回车即可。

## Linux

### 使用预编译包（推荐）
预编译包可在 [GitHub Releases](https://github.com/LanRhyme/MicYou/releases) 下载。

**DEB 包（适用于 Debian/Ubuntu/Mint 等发行版）：**
```bash
# 从 GitHub Releases 下载 .deb 包
sudo dpkg -i MicYou-*.deb
# 如果缺少依赖：
sudo apt install -f
```

**RPM 包（适用于 Fedora/RHEL/openSUSE 等发行版）：**
```bash
# 从 GitHub Releases 下载 .rpm 包
sudo rpm -i MicYou-*.rpm
# 或者使用 dnf/yum：
sudo dnf install MicYou-*.rpm
```

**AUR 仓库（适用于 Arch Linux 及其衍生发行版）：**
```bash
# 克隆 AUR 仓库并自动安装软件包及其依赖
git clone https://aur.archlinux.org/micyou-bin.git
cd micyou-bin
makepkg -si

# 或者使用 paru 等 AUR helpers
paru -S micyou-bin
```

**运行应用：**
```bash
# 安装后可以从应用菜单运行 MicYou
# 或者从终端运行：
MicYou
```