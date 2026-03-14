# 常见问题

## 无法连接设备

### Wi-Fi 模式

1. **确认防火墙设置**

   Windows 系统可能会拦截入站连接。请按照以下方法手动放行端口：

   1. 按下 `Win+R`，输入 `cmd`，同时按住 `Ctrl+Shift`，点击「确定」以管理员身份运行命令提示符。
   2. 输入以下命令：

      ```cmd
      netsh advfirewall firewall add rule name="Allow 6666" dir=in action=allow protocol=TCP localport=6000
      ```

      > MicYou 默认使用端口 `6000` 建立连接，如需更改请修改上述命令中的端口号。

      若未出现任何提示，表示操作成功，可以重新尝试连接。

2. **检查设备是否在同一子网**

   - 确保 Android 手机和 PC 连接的是**同一个**路由器的 Wi-Fi
   - 确保路由器已关闭 **AP 隔离** 或 **网络设备隔离** 功能（详情请参阅路由器说明书）

> [!TIP]
> 高级用户可尝试使用 Nmap 或 ping 等工具检查连接性

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

![输入设备](https://github.com/user-attachments/assets/1cf5f97f-1647-4fb0-a152-85be2697df39)

![输出设备](https://github.com/user-attachments/assets/9e9ef42d-186f-42a6-ba4d-7b1a3815f860)