---
title: 常见问题 - MicYou 故障排除
description: MicYou 常见问题解答，包括设备连接问题、防火墙设置、ADB 配置和音频输出故障排除等。
keywords: MicYou常见问题,MicYou故障排除,MicYou无法连接,防火墙设置,ADB问题,音频问题
---

# 常见问题

## 无法连接设备

### Wi-Fi 模式

1. **确认防火墙设置**

   Windows 防火墙可能会拦截入站连接。请按照以下方法手动放行端口：

   1. 按下 `Win+R`，输入 `powershell`，同时按住 `Ctrl+Shift`，点击「确定」以管理员身份运行 PowerShell。
   2. 输入以下命令：

      ```powershell
      New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
      New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
      ```

      > MicYou 默认使用 TCP 端口 `6000`（控制通道）和 UDP 端口 `6001`（音频数据）。如已修改端口号，请将命令中的端口号替换为实际值。

      若未出现任何错误提示，表示操作成功，可以重新尝试连接。

2. **检查设备是否在同一子网**

   - 确保 Android 手机和 PC 连接的是**同一个**路由器的 Wi-Fi
   - 确保路由器已关闭 **AP 隔离** 或 **网络设备隔离** 功能（详情请参阅路由器说明书）

> [!TIP]
> 高级用户可尝试使用 Nmap 或 ping 等工具检查连接性。

### USB (ADB) 模式

1. **开启开发者选项**

   > 此处列出的步骤可能不适用于所有设备，**建议使用搜索引擎**查找适用于您设备的 ADB 教程。

   - 在手机设置中找到"关于本机"，连续点击 7 次"系统版本号"开启开发者选项
   - 进入开发者选项，开启 **USB 调试**

2. **确认 ADB 连接**

   > 电脑端需要安装 ADB 工具（参见第 1 步：下载 ADB）。

   运行以下命令，确认有且仅有一个设备已连接：

   ```bash
   adb devices
   ```

   如果列出了多个设备，则需要指定目标设备进行端口转发：

   ```bash
   adb -s <设备序列号> reverse tcp:6000 tcp:6000
   ```

   > 设备序列号可在 `adb devices` 的输出中找到。

## 连接设备后无声音输出

请确保 VB-Audio 驱动已正确安装，且以下设备均**未被禁用**：

- **输出设备**：CABLE Input (VB-Audio Virtual Cable)
- **输入设备**：CABLE Output (VB-Audio Virtual Cable)

检查方式：打开「设置」> 「声音」，验证两个设备均为**已启用**状态：

![输入设备](/input-device.png)

![输出设备](/output-device.png)