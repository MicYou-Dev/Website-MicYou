---
title: 快速开始 - MicYou
description: 快速上手 MicYou。通过 Wi-Fi、USB 数据线或 Web 网页将手机麦克风低延迟串流到电脑，并在 Discord、微信、QQ、OBS 等软件中作为麦克风使用。
keywords: MicYou,手机麦克风,电脑麦克风,Wi-Fi连接,Web麦克风,ADB连接,虚拟声卡,VB-CABLE,BlackHole,PipeWire,防火墙设置
---

# 快速开始

只需简单几步，即可把手机麦克风串流至电脑，当作高音质独立麦克风使用。

## 1. 准备工作

### 步骤一：安装电脑端与虚拟声卡

电脑上的软件（如 Discord、微信、游戏语音）需要通过**虚拟声卡驱动**来接收手机传来的音频流：

1. **下载并安装 MicYou 电脑端**：前往 [下载页面](/download) 获取对应操作系统的安装包（Windows / macOS / Linux）。
2. **安装虚拟声卡驱动**：
   - **Windows**：前往 [VB-Audio 官网](https://vb-audio.com/Cable/) 下载免费的 **VB-CABLE Driver**。解压后右键选择「以管理员身份运行」`VBCABLE_Setup_x64.exe`，安装完成后**建议重启一次电脑**。
   - **macOS**：推荐使用 Homebrew 安装开源的 BlackHole 虚拟声卡：
     ```bash
     brew install blackhole-2ch --cask
     ```
     > 安装后若首次打开提示未受信任，前往「系统设置」>「隐私与安全性」点击「仍要打开」。
   - **Linux**：MicYou 原生适配 **PipeWire**，启动后会自动创建虚拟音频输入节点，无需额外安装驱动。

### 步骤二：准备手机端

根据使用场景选择适合你的方式：

- **App 方式（推荐）**：在 [下载页面](/download) 下载安装 MicYou Android 客户端（`.apk`）。首次打开时请授予麦克风录音权限。
- **Web 网页免安装**：无需安装任何 App，直接用手机浏览器扫码即可使用（适合临时借用电脑）。

## 2. 选择连接方式

### 方式 A：Wi-Fi 局域网连接（无线首选）

无需插线，配置最快，适合日常聊天、会议与网课。

1. **连入同一局域网**：确保手机和电脑连接到同一个 Wi-Fi（同一路由器）。
2. **放行电脑防火墙**：
   - Windows 首次启动 MicYou 弹出防火墙窗口时，务必勾选「专用网络」和「公用网络」并允许访问。
   - 若之前误点了取消或连接超时，以管理员身份运行 PowerShell 执行以下命令放行端口：
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux 用户若启用了 `ufw`，可执行：`sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`
3. **建立连接**：
   - 电脑端打开 MicYou，选择 **Wi-Fi** 模式，界面会显示电脑的局域网 IP 与端口。
   - 手机端打开 MicYou App，输入对应的 IP 和端口，点击「连接」。
   - 对着手机说话，观察电脑端 MicYou 界面上的音量电平跳动，即代表音频传输成功！

### 方式 B：USB 数据线连接（超低延迟）

不受 Wi-Fi 信号波动影响，延迟稳定在 10ms 以内，适合对低延迟要求极高的竞技游戏或受限网络（如校园网 / 开启了 AP 隔离的网络）。

1. **开启手机 USB 调试**：
   - 进入手机「设置」>「关于手机」，连续点击「版本号」**7 次**进入开发者模式。
   - 返回「设置」>「系统 / 更多设置」>「开发者选项」，开启 **USB 调试**。
2. **连接电脑并授权**：
   - 用数据线将手机连至电脑。
   - 手机弹出「允许 USB 调试吗？」时，勾选「始终允许」并点击确定。
3. **开始串流**：
   - 电脑端与手机端的 MicYou 均切换到 **USB** 模式并点击连接。

> [!NOTE] ADB 运行环境
> MicYou 桌面端会自动调用 ADB。若系统提示未找到 ADB，可通过包管理器一键安装：
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

### 方式 C：Web 网页免安装连接

无需在手机安装 APK，适合在他人电脑上临时应急使用。

1. 确保手机与电脑在同一 Wi-Fi 网络下（防火墙规则同 Wi-Fi 模式）。
2. 电脑端 MicYou 切换到 **Web** 模式，界面会生成访问二维码与局域网链接。
3. 手机使用自带相机或现代浏览器（Chrome、Safari、Edge 等）扫码打开网页。
4. 网页请求录音权限时点击 **「允许使用麦克风」**，音频即通过 WebRTC 实时串流到电脑。

## 3. 在聊天 / 会议 / 游戏软件中选用麦克风

音频连接建立后，只需在目标软件中将麦克风指向虚拟声卡：

1. **确认 MicYou 电脑端输出设置**：
   - **音频输出设备** 选择虚拟声卡的输入端：
     - **Windows**：`CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：默认 PipeWire 虚拟输出节点
2. **在目标软件中设置输入设备**：
   - 打开聊天软件（Discord、微信、QQ、腾讯会议、OBS、Steam 语音等）的音频设置。
   - 将 **麦克风（音频输入）** 选为：
     - **Windows**：`CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：PipeWire 对应的 `MicYou` 虚拟麦克风
3. 现在对手机说话，目标软件就能直接采集到清晰的麦克风声音了！

## 4. 常见排查与使用建议

- **Wi-Fi 模式连不上？**  
  检查电脑防火墙是否放行了 TCP 6000 和 UDP 6001。公共 Wi-Fi 或校园网往往开启了「AP 隔离」，禁止设备互联，此时建议切换为 USB 数据线连接或开启手机热点。
- **电平有跳动，但聊天软件里听不到声音？**  
  重点检查输入输出方向：MicYou 电脑端的输出应为 **`CABLE Input`**，而第三方软件的麦克风输入应为 **`CABLE Output`**。
- **手机锁屏后声音断开？**  
  部分 Android 系统会在锁屏后强制冻结后台网络和麦克风。请在手机「设置」>「应用管理」>「MicYou」>「电池 / 耗电管理」中设为 **「无限制」**（允许完全后台运行），并在多任务切换界面锁定 MicYou。

> [!TIP]
> 遇到其他问题？请查阅 [常见问题 (FAQ)](/docs/faq) 获取更全面的排查方法。