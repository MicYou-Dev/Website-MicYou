---
title: 常見問題 - MicYou 故障排除
description: MicYou 常見問題解答，包括裝置連線問題、防火牆設定、ADB 設定和音訊輸出故障排除等。
keywords: MicYou常見問題,MicYou故障排除,MicYou無法連線,防火牆設定,ADB問題,音訊問題
---

# 常見問題

## 無法連線裝置

### Wi-Fi 模式

1. **確認防火牆設定**

   Windows 防火牆可能會攔截入站連線。請按照以下步驟手動放行連接埠：

   1. 按下 `Win+R`，輸入 `powershell`，同時按住 `Ctrl+Shift`，點選「確定」以系統管理員身分執行 PowerShell。
   2. 輸入以下命令：

      ```powershell
      New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
      New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
      ```

      > MicYou 預設使用 TCP 連接埠 `6000`（控制通道）和 UDP 連接埠 `6001`（音訊資料）。如已修改連接埠號，請將命令中的連接埠號替換為實際值。

      若未出現任何錯誤訊息，表示操作成功，可嘗試重新連線。

2. **檢查裝置是否在同一子網路**

   - 確保 Android 手機與 PC 連接的是**同一個**路由器的 Wi-Fi
   - 確保路由器已關閉 **AP 隔離** 或 **網路裝置隔離** 功能（詳情請參考路由器說明書）

> [!TIP]
> 進階使用者可使用 Nmap 或 ping 等工具檢查連線性。

### USB (ADB) 模式

1. **開啟開發者選項**

   > 不同裝置的步驟可能不同，**建議使用搜尋引擎**搜尋為您的裝置開啟 ADB 的教學。

   - 在手機設定中找到「關於本機」，連續點擊 7 次「系統版本號」以開啟開發者選項
   - 進入開發者選項，開啟 **USB 偵錯**

2. **確認 ADB 連線**

   > 電腦端需安裝 ADB 工具（參見第 1 步：下載 ADB）。

   執行以下命令確認有且僅有一個裝置已連線：

   ```bash
   adb devices
   ```

   若列出多個裝置，需指定目標裝置進行連接埠轉發：

   ```bash
   adb -s <裝置序列號> reverse tcp:6000 tcp:6000
   ```

   > 裝置序列號可在 `adb devices` 的輸出中找到。

## 連線裝置後無聲音輸出

請確保 VB-Audio 驅動已正確安裝，且以下裝置未被停用：

- **輸出裝置**：CABLE Input (VB-Audio Virtual Cable)
- **輸入裝置**：CABLE Output (VB-Audio Virtual Cable)

檢查方式：開啟「設定」> 「聲音」，確保以下兩項均為**已啟用**狀態：

![輸入裝置](/input-device.png)

![輸出裝置](/output-device.png)