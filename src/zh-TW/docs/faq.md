---
title: 常見問題 - MicYou 疑難排解
description: MicYou 常見問題解答，包括裝置連線問題、防火牆設定、ADB 設定、音訊輸出疑難排解及 Linux 渲染問題等。
keywords: MicYou常見問題,MicYou疑難排解,MicYou無法連線,防火牆設定,ADB問題,音訊問題,PipeWire,軟體渲染
---

# 常見問題

## 無法連線裝置

### Wi-Fi 模式

1. **確認防火牆設定**

   Windows 防火牆可能會攔截傳入連線。請按照以下方法手動放行連接埠：

   1. 按下 `Win+R`，輸入 `powershell`，同時按住 `Ctrl+Shift`，點擊「確定」以系統管理員身分執行 PowerShell。
   2. 輸入以下命令：

      ```powershell
      New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
      New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
      ```

      > MicYou 預設使用 TCP 連接埠 `6000`（控制通道）和 UDP 連接埠 `6001`（音訊串流）。如已修改連接埠號，請將命令中的連接埠替換為實際值。

      若未出現任何錯誤提示，表示操作成功，可以重新嘗試連線。

2. **檢查裝置是否在同一子網路**

   - 確保 Android 手機和 PC 連線的是**同一個**路由器的 Wi-Fi
   - 確保路由器已關閉 **AP 隔離** 或 **網路裝置隔離** 功能（詳情請參閱路由器說明書）

> [!TIP]
> 進階使用者可嘗試使用 ping 或 nmap 等工具排查手機與電腦之間的網路連通性。

### USB (ADB) 模式

1. **開啟開發人員選項**

   - 在手機設定中找到「關於手機」，連續點擊 7 次「版本號碼」開啟開發人員選項
   - 進入開發人員選項，開啟 **USB 偵錯**

2. **確認 ADB 連線**

   執行以下命令，確認有且僅有一個裝置已成功授權連線：

   ```bash
   adb devices
   ```

   如果列出了多個裝置，則需要指定目標裝置序號進行連接埠轉發：

   ```bash
   adb -s <裝置序號> reverse tcp:6000 tcp:6000
   ```

   > 裝置序號可在 `adb devices` 的輸出中找到。

### Web 網頁模式

1. **無法開啟網頁**：確認手機與電腦連線至同一 Wi-Fi，且電腦防火牆放行了桌面端提示的 Web 連接埠。
2. **麥克風無法錄製**：請確保手機瀏覽器支援 WebRTC 標準（推薦 Chrome、Safari、Edge 或 Firefox），並在瀏覽器提示中選擇「允許存取麥克風」。

## 連線裝置後無聲音輸出

### Windows

請確保 VB-Audio 驅動程式已正確安裝，且以下裝置均**未被停用**：

- **輸出裝置**：CABLE Input (VB-Audio Virtual Cable)
- **輸入裝置**：CABLE Output (VB-Audio Virtual Cable)

檢查方式：開啟「設定」> 「聲音」，驗證兩個裝置均為**已啟用**狀態：

![輸入裝置](/input-device.png)

![輸出裝置](/output-device.png)

### macOS

請確保 BlackHole 驅動程式已正確安裝：

若未安裝 `switchaudio-osx`，您需要手動在 「系統設定」/「系統偏好設定」>「聲音」>「輸入」中將麥克風切換為 BlackHole。

![輸入裝置](/macos-sound-zhtw.png)

### Linux (PipeWire)

MicYou 針對 PipeWire 實作了原生整合。若系統未辨識到虛擬節點，請檢查 PipeWire 服務狀態：

```bash
systemctl --user status pipewire pipewire-pulse
```

## 結束軟體後裝置自帶麥克風無法使用

### macOS

若您的 Mac 已有麥克風，當您未安裝 `switchaudio-osx` 或者軟體非正常結束時，麥克風設定可能不會自動還原。

您需要手動在 「系統設定」/「系統偏好設定」>「聲音」>「輸入」中改回您的裝置麥克風（如「MacBook Pro 麥克風」）。

## Linux 客戶端出現白畫面或視窗透明

部分 Linux 發行版（特別是搭載 NVIDIA 獨立顯示卡或特定版本的 WebKitGTK 環境）在 DMA-BUF 硬體加速渲染時可能出現白畫面或透明視窗異常。

可透過附加 `--software-rendering` 參數啟動：

```bash
MicYou --software-rendering
```

或者設定環境變數：

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
MicYou
```