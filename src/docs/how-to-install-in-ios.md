---
title: 在 iOS 上安装 - MicYou
description: 在 iOS 设备上自签安装 MicYou 的教程，支持使用 Sideloadly 或 LiveContainer + SideStore 进行侧载安装。
keywords: MicYou iOS,iOS自签,iOS侧载,Sideloadly,SideStore,LiveContainer,IPA安装,iPhone麦克风
---

# 在 iOS 上安装

[MicYou for iOS](https://github.com/MicYou-Dev/MicYou-iOS) 需要 **iOS 18.0 及以上**系统。由于未上架 App Store，可使用 **Sideloadly**、**LiveContainer + SideStore**、**AltStore** 等侧载工具自签安装。

免费 Apple ID 签名存在以下限制：
- 签名有效期为 **7 天**，到期后需续签，否则应用无法打开。
- 单个免费 Apple ID 最多同时安装 **3 个**侧载应用。

## 准备工作

- **硬件**：macOS 或 Windows 电脑、iPhone / iPad（iOS 18+）及可靠的数据线。
- **账号**：使用邮箱注册的 [Apple ID](https://support.apple.com/zh-cn/apple-account)（手机号注册的账号不支持自签）。
- **Windows 环境**：需安装非 Microsoft Store 版本的 [iTunes](https://www.apple.com.cn/itunes/)（若已安装商店版，请先卸载）。
- **IPA 安装包**：从[下载页](/download)或 [GitHub Releases](https://github.com/MicYou-Dev/MicYou-iOS/releases/latest) 下载：
  - `MicYou-<版本>.ipa`：完整版（含锁屏实时活动与灵动岛），用于 **Sideloadly**、**SideStore** 或 **AltStore** 直接安装。
  - `MicYou-<版本>-LiveContainer.ipa`：移除小组件扩展的 **LiveContainer 专用版**。

## 方法一：使用 Sideloadly 安装

1. 下载并安装 [Sideloadly](https://sideloadly.io/#download)。
2. 打开 Sideloadly，在 `Apple ID` 栏输入 Apple 账号邮箱。
3. 用数据线将 iOS 设备连至电脑，在手机上点击**信任此电脑**并输入锁屏密码。
4. 点击左侧 `IPA` 图标，选择 `MicYou-<版本>.ipa`，点击 `Start` 开始安装（建议保持左侧自动刷新图标开启，以便在同一 Wi-Fi 下自动续签）。
5. 按提示输入 Apple ID 密码及双重认证验证码，等待进度显示 `Done.` 即安装完成。

## 方法二：使用 LiveContainer + SideStore 安装

此方案配置完成后，只需在手机端开启 VPN 即可随时续签，且安装在 LiveContainer 内的应用不占用侧载数量限制。

### 1. 开启开发者模式（iOS 16+）

前往 iOS `设置` -> `隐私与安全性` -> 底部 `开发者模式` -> **开启**，按提示重启设备并确认开启。

### 2. 安装并信任 LiveContainer + SideStore

1. 在电脑上下载并打开 [iloader](https://github.com/nab138/iloader/releases/latest)。
2. 连接 iOS 设备至电脑并选择“信任此电脑”。
3. 在 iloader 中登录 Apple ID，点击 **LiveContainer + SideStore (Stable)** 完成安装。
4. 前往 iOS `设置` -> `通用` -> `VPN 与设备管理`，在 `开发者 APP` 下点击你的 Apple ID 并选择**信任**。

### 3. 配置证书与安装 MicYou

1. 在 App Store 下载 [LocalDevVPN](https://apps.apple.com/hk/app/localdevvpn/id6755608044)（需外区 ID）并保持开启。
2. 打开 **LiveContainer**，点击左上角 **SideStore** 图标（首次可能闪退，重开即可）。
3. 在 SideStore 的 **My Apps** 页面点击 `Refresh All`，登录 Apple ID 完成激活。
4. 返回 **LiveContainer** -> **设置**，点击 `从 SideStore 导入证书`。
5. 安装 MicYou（二选一）：
   - **LiveContainer 内安装（不占名额）**：在 LiveContainer 主页点击左上角 **“+”**，选择 `MicYou-<版本>-LiveContainer.ipa`。
   - **SideStore 独立安装（支持实时活动与灵动岛）**：在 SideStore 的 **My Apps** 页面点击左上角 **“+”**，选择标准版 `MicYou-<版本>.ipa`。

## 常见问题

- **提示“不受信任的开发者”**：前往 `设置` -> `通用` -> `VPN 与设备管理`，点击你的 Apple ID 并选择**信任**。
- **实时活动或灵动岛不可用**：LiveContainer 专用版不含小组件扩展；若需使用实时活动和灵动岛，请通过 Sideloadly 或 SideStore 直接安装标准版 `MicYou-<版本>.ipa`。
