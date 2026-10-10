---
title: 在 iOS 上安裝 - MicYou
description: 在 iOS 裝置上自簽安裝 MicYou 的教學，支援使用 Sideloadly 或 LiveContainer + SideStore 進行側載安裝。
keywords: MicYou iOS,iOS自簽,iOS側載,Sideloadly,SideStore,LiveContainer,IPA安裝,iPhone麥克風
---

# 在 iOS 上安裝

[MicYou for iOS](https://github.com/MicYou-Dev/MicYou-iOS) 需要 **iOS 18.0 及以上**系統。由於未上架 App Store，可使用 **Sideloadly**、**LiveContainer + SideStore**、**AltStore** 等側載工具自簽安裝。

免費 Apple ID 簽名存在以下限制：
- 簽名有效期為 **7 天**，到期後需續簽，否則應用程式無法開啟。
- 單一免費 Apple ID 最多同時安裝 **3 個**側載應用程式。

## 準備工作

- **硬體**：macOS 或 Windows 電腦、iPhone / iPad（iOS 18+）及穩定的傳輸線。
- **帳號**：使用電子郵件註冊的 [Apple ID](https://support.apple.com/zh-tw/apple-account)（手機號碼註冊的帳號不支援自簽）。
- **Windows 環境**：需安裝非 Microsoft Store 版本的 [iTunes](https://www.apple.com/itunes/)（若已安裝商店版，請先解除安裝）。
- **IPA 安裝套件**：從[下載頁](/zh-TW/download)或 [GitHub Releases](https://github.com/MicYou-Dev/MicYou-iOS/releases/latest) 下載：
  - `MicYou-<版本>.ipa`：完整版（含鎖定畫面即時動態、動態島與控制中心按鈕），用於 **Sideloadly**、**SideStore** 或 **AltStore** 直接安裝。
  - `MicYou-<版本>-LiveContainer.ipa`：移除小工具擴充功能的 **LiveContainer 專用版**。

## 方法一：使用 Sideloadly 安裝

1. 下載並安裝 [Sideloadly](https://sideloadly.io/#download)。
2. 開啟 Sideloadly，在 `Apple ID` 欄位輸入 Apple 帳號信箱。
3. 用傳輸線將 iOS 裝置連至電腦，在手機上點擊**信任這部電腦**並輸入鎖定畫面密碼。
4. 點擊左側 `IPA` 圖示，選擇 `MicYou-<版本>.ipa`，點擊 `Start` 開始安裝（建議保持左側自動重新整理圖示開啟，以便在同一 Wi-Fi 下自動續簽）。
5. 按提示輸入 Apple ID 密碼及雙重認證驗證碼，等待進度顯示 `Done.` 即安裝完成。

## 方法二：使用 LiveContainer + SideStore 安裝

此方案設定完成後，只需在手機端開啟 VPN 即可隨時續簽，且安裝在 LiveContainer 內的應用程式不佔用側載數量限制。

### 1. 開啟開發者模式（iOS 16+）

前往 iOS `設定` -> `隱私權與安全性` -> 底部 `開發者模式` -> **開啟**，按提示重新啟動裝置並確認開啟。

### 2. 安裝並信任 LiveContainer + SideStore

1. 在電腦上下載並開啟 [iloader](https://github.com/nab138/iloader/releases/latest)。
2. 連接 iOS 裝置至電腦並選擇「信任這部電腦」。
3. 在 iloader 中登入 Apple ID，點擊 **LiveContainer + SideStore (Stable)** 完成安裝。
4. 前往 iOS `設定` -> `一般` -> `VPN 與裝置管理`，在 `開發者 APP` 下點擊你的 Apple ID 並選擇**信任**。

### 3. 設定憑證與安裝 MicYou

1. 在 App Store 下載 [LocalDevVPN](https://apps.apple.com/app/localdevvpn/id6755608044) 並保持開啟。
2. 開啟 **LiveContainer**，點擊左上角 **SideStore** 圖示（首次可能閃退，重開即可）。
3. 在 SideStore 的 **My Apps** 頁面點擊 `Refresh All`，登入 Apple ID 完成啟用。
4. 返回 **LiveContainer** -> **設定**，點擊 `從 SideStore 匯入憑證`。
5. 安裝 MicYou（二選一）：
   - **LiveContainer 內安裝（不佔名額）**：在 LiveContainer 主頁點擊左上角 **「+」**，選擇 `MicYou-<版本>-LiveContainer.ipa`。
   - **SideStore 獨立安裝（支援即時動態與動態島）**：在 SideStore 的 **My Apps** 頁面點擊左上角 **「+」**，選擇標準版 `MicYou-<版本>.ipa`。

## 常見問題

- **提示「不受信任的開發者」**：前往 `設定` -> `一般` -> `VPN 與裝置管理`，點擊你的 Apple ID 並選擇**信任**。
- **即時動態或動態島不可用**：LiveContainer 專用版不含小工具擴充功能；若需使用即時動態、動態島和控制中心按鈕，請透過 Sideloadly 或 SideStore 直接安裝標準版 `MicYou-<版本>.ipa`。
