# 常見問題

## 無法連線裝置

### Wi-Fi 模式

1. **確認防火牆設定**

   Windows 系統可能會攔截入站連線。請按照以下步驟手動放行連接埠：

   1. 按下 `Win+R`，輸入 `cmd`，同時按住 `Ctrl+Shift`，點選「確定」以系統管理員身分執行命令提示字元
   2. 輸入以下命令：

      ```cmd
      netsh advfirewall firewall add rule name="Allow 6666" dir=in action=allow protocol=TCP localport=6000
      ```

      > MicYou 預設使用連接埠 `6000` 建立連線，如需更改請修改上述命令中的連接埠號。

      若未出現任何訊息，表示操作成功，可嘗試重新連線。

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

![輸入裝置](https://github.com/user-attachments/assets/1cf5f97f-1647-4fb0-a152-85be2697df39)

![輸出裝置](https://github.com/user-attachments/assets/9e9ef42d-186f-42a6-ba4d-7b1a3815f860)