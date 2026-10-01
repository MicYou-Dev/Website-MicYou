---
title: 快速开始 - MicYou 安装与配置指南
description: MicYou 快速上手指南。了解如何通过 Wi-Fi 局域网、Web 网页或 USB (ADB) 将手机麦克风串流至电脑，并在 Discord、微信、QQ、OBS 等软件中作为麦克风使用。
keywords: MicYou,手机麦克风,电脑麦克风,Wi-Fi连接,Web麦克风,ADB连接,虚拟声卡,VB-CABLE,BlackHole,PipeWire,防火墙设置
---

# 快速开始

MicYou 可以将你的手机作为高品质的电脑麦克风使用，支持 Wi-Fi 局域网、Web 网页和 USB 数据线连接。

## 1. 准备工作

### 步骤一：安装电脑端与虚拟声卡

要让电脑上的软件（如 Discord、微信、游戏）识别到手机传来的声音，电脑上需要一个**虚拟麦克风驱动**来接收音频：

1. **下载并安装 MicYou 电脑端**：前往 [下载页面](/download) 获取对应操作系统的安装包（Windows / macOS / Linux）。
2. **安装虚拟声卡驱动**：
   - **Windows**：前往 [VB-Audio 官网](https://vb-audio.com/Cable/) 下载免费的 **VB-CABLE Driver**。解压后右键选择「以管理员身份运行」`VBCABLE_Setup_x64.exe`，安装完成后建议重启一次电脑。
   - **macOS**：推荐使用 Homebrew 安装 BlackHole 虚拟声卡驱动：
     ```bash
     brew install blackhole-2ch --cask
     ```
     > 安装后若打开 MicYou 提示安全拦截，请在「系统设置」>「隐私与安全性」中点击「仍要打开」。
   - **Linux**：MicYou 原生适配 **PipeWire**，启动后会自动创建音频输入节点，通常无需安装第三方驱动。

### 步骤二：准备手机端

根据你的使用习惯，选择以下任意一种方式：

- **App 方式（推荐）**：前往 [下载页面](/download) 下载并安装 MicYou Android 客户端 (`.apk`)。首次打开请授予麦克风权限。
- **免安装 Web 方式**：无需在手机安装任何 App，直接使用手机自带的现代浏览器（Chrome、Safari、Edge 等）扫码即可使用。

## 2. 连接方式一：Wi-Fi 局域网模式（首选推荐）

无线局域网模式无需插线，配置最快，适合日常语音聊天、网课和会议。

### 步骤一：连接网络与放行防火墙

1. **同一网络**：确保手机和电脑连接到了**同一个 Wi-Fi**（同一台路由器）。
2. **放行电脑防火墙（关键）**：
   - **首次运行弹窗**：Windows 首次启动 MicYou 时通常会弹出防火墙授权窗口，请**务必勾选「专用网络」和「公用网络」**并点击「允许访问」。
   - **手动放行规则**：如果之前误点了取消、或连接时提示超时，请以管理员身份打开 PowerShell 执行以下命令放行端口：
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux 用户若启用了 `ufw` 防火墙，可执行：`sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`

### 步骤二：电脑端启动监听

1. 打开 MicYou 桌面端，选择 **Wi-Fi** 模式。
2. 界面上会显示当前电脑的局域网 IP（例如 `192.168.1.100`）和默认端口（控制端口 `6000` / 音频端口 `6001`）。

### 步骤三：手机端发起连接

1. 打开手机上的 MicYou App。
2. 输入电脑端显示的 IP 地址和端口号，点击「连接」。
3. 对着手机说话，观察电脑端 MicYou 界面上的音量电平条。如果有波形跳动，说明无线音频流已正常建立！

## 3. 连接方式二：Web 网页模式（免装客户端）

如果你是在朋友的电脑上临时借用、不想在手机安装 APK，可以使用 Web 模式：

1. 确保手机与电脑在同一个 Wi-Fi 网络下（防火墙放行规则与上方 Wi-Fi 模式相同）。
2. 在电脑端 MicYou 界面中切换到 **Web** 模式。
3. 电脑端界面会自动生成一个访问二维码和局域网 URL（如 `http://192.168.1.100:6000`）。
4. 使用手机系统相机或浏览器扫描该二维码打开网页。
5. 在手机浏览器弹出的权限提示中点击 **「允许使用麦克风」**，网页即可通过 WebRTC 实时将声音串流至电脑。

## 4. 连接方式三：USB 数据线模式（极低延迟）

如果你需要打高要求竞技游戏、或者当前处于校园网/公共 Wi-Fi 导致局域网不稳定/开启了 AP 隔离，推荐使用 USB 数据线模式：

### 步骤一：开启手机 USB 调试

1. 打开手机「设置」>「关于手机」（部分机型在「系统信息」）。
2. 连续快速点击「版本号」（或「编译版本号」）**7 次**，直到屏幕提示已进入开发者模式。
3. 返回手机「设置」>「系统」或「其他设置」>「开发者选项」，找到并开启 **USB 调试**。

### 步骤二：连接电脑并授权

1. 使用 USB 数据线将手机与电脑连接。
2. 手机屏幕会弹出「允许 USB 调试吗？」的授权窗口，勾选「始终允许使用这台计算机进行调试」并点击确定。

### 步骤三：启动 USB 传输

1. 在电脑端与手机端的 MicYou 中均切换至 **USB** 模式。
2. 点击连接，即可享受稳定无波动的低延迟音频传输。

> [!NOTE] ADB 运行环境
> MicYou 桌面端会自动检测并调用 ADB 通道。如果系统提示未找到 ADB，可通过包管理器一键安装：
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

## 5. 在通话 / 游戏 / 会议软件中设置麦克风

音频传输建立后，最后一步是在你的目标软件中选用虚拟麦克风：

1. **检查 MicYou 电脑端设置**：
   - 将 MicYou 的 **音频输出设备** 选为虚拟声卡的输入端：
     - **Windows**：`CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：默认 PipeWire 虚拟节点
2. **配置聊天 / 会议软件**：
   - 打开你的聊天软件（Discord、微信、QQ、腾讯会议、OBS、Steam 语音等），进入声音/音频设置。
   - 将 **麦克风（输入设备）** 更改为：
     - **Windows**：`CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：PipeWire 对应的 `MicYou` 输入节点
3. 现在与朋友通话或录音测试，软件就会直接拾取手机端传来的清晰声音！

## 常见排坑与注意事项

### 1. Wi-Fi 模式提示连接失败或超时？
- **防火墙拦截**：确保已在 Windows 防火墙或 Linux ufw 中放行 TCP 6000 和 UDP 6001 端口。
- **路由器 AP 隔离**：部分公共 Wi-Fi、校园网或路由器的「访客模式」开启了 AP 隔离，禁止局域网设备互访。可以尝试手机开启热点让电脑连接，或者改用 USB 数据线模式。

### 2. 看到电平在跳动，但在聊天软件里没声音？
- 确认音频设备方向：MicYou 电脑端的输出应为 **`CABLE Input`**，而第三方软件的麦克风输入应为 **`CABLE Output`**。
- 检查 Windows 系统声音设置中 `CABLE Output` 是否被静音或音量过小。

### 3. 手机锁屏后声音中断或断断续续？
- 部分 Android 系统的后台激进省电策略会在锁屏后挂起后台网络与麦克风。
- 请进入手机「设置」>「应用管理」>「MicYou」>「电池 / 耗电管理」，设置为 **「无限制」** 或 **「允许完全后台行为」**，并在多任务视图中锁定 MicYou。

> [!TIP]
> 遇到其他问题？请查阅 [常见问题 (FAQ)](/docs/faq) 获取更详细的故障排除方案。