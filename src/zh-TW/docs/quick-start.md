---
title: 快速開始 - MicYou 安裝與設定指南
description: MicYou 快速上手指南。了解如何透過 Wi-Fi 區域網路、Web 網頁或 USB (ADB) 將手機麥克風串流至電腦，並在 Discord、微信、QQ、OBS 等軟體中作為麥克風使用。
keywords: MicYou,手機麥克風,電腦麥克風,Wi-Fi連線,Web麥克風,ADB連線,虛擬音效卡,VB-CABLE,BlackHole,PipeWire,防火牆設定
---

# 快速開始

MicYou 可以將你的手機作為高品質的電腦麥克風使用，支援 Wi-Fi 區域網路、Web 網頁與 USB 資料線連線。

## 1. 準備工作

### 步驟一：安裝電腦端與虛擬音效卡

要讓電腦上的軟體（如 Discord、微信、遊戲）識別到手機傳來的聲音，電腦上需要一個**虛擬麥克風驅動程式**來接收音訊：

1. **下載並安裝 MicYou 電腦端**：前往 [下載頁面](/zh-TW/download) 獲取對應作業系統的安裝套件（Windows / macOS / Linux）。
2. **安裝虛擬音效卡驅動程式**：
   - **Windows**：前往 [VB-Audio 官網](https://vb-audio.com/Cable/) 下載免費的 **VB-CABLE Driver**。解壓縮後按右鍵選擇「以系統管理員身分執行」`VBCABLE_Setup_x64.exe`，安裝完成後建議重新啟動一次電腦。
   - **macOS**：建議使用 Homebrew 安裝 BlackHole 虛擬音效卡驅動程式：
     ```bash
     brew install blackhole-2ch --cask
     ```
     > 安裝後若開啟 MicYou 提示安全性攔截，請在「系統設定」>「隱私權與安全性」中點擊「仍要開啟」。
   - **Linux**：MicYou 原生適配 **PipeWire**，啟動後會自動建立音訊輸入節點，通常無需安裝第三方驅動程式。

### 步驟二：準備手機端

根據你的使用習慣，選擇以下任意一種方式：

- **App 方式（推薦）**：前往 [下載頁面](/zh-TW/download) 下載並安裝 MicYou Android 客戶端 (`.apk`)。首次開啟請授予麥克風權限。
- **免安裝 Web 方式**：無需在手機安裝任何 App，直接使用手機內建的現代瀏覽器（Chrome、Safari、Edge 等）掃描 QR Code 即可使用。

## 2. 連線方式一：Wi-Fi 區域網路模式（首選推薦）

無線區域網路模式無需插線，設定最快，適合日常語音聊天、線上課程與會議。

### 步驟一：連入同一網路與放行防火牆

1. **同一網路**：確保手機和電腦連線到了**同一個 Wi-Fi**（同一台路由器）。
2. **放行電腦防火牆（重要）**：
   - **首次執行彈窗**：Windows 首次啟動 MicYou 時通常會跳出防火牆授權視窗，請**務必勾選「私人網路」與「公用網路」**並點擊「允許存取」。
   - **手動放行規則**：若先前誤點了取消、或連線時提示逾時，請以系統管理員身分開啟 PowerShell 執行以下命令放行連接埠：
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux 使用者若啟用了 `ufw` 防火牆，可執行：`sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`

### 步驟二：電腦端啟動監聽

1. 開啟 MicYou 桌面端，選擇 **Wi-Fi** 模式。
2. 介面上會顯示目前電腦的區域網路 IP（例如 `192.168.1.100`）和預設連接埠（控制埠 `6000` / 音訊埠 `6001`）。

### 步驟三：手機端發起連線

1. 開啟手機上的 MicYou App。
2. 輸入電腦端顯示的 IP 位址與連接埠號，點擊「連線」。
3. 對著手機說話，觀察電腦端 MicYou 介面上的音量電平條。若有波形跳動，代表音訊傳輸已正常建立！

## 3. 連線方式二：Web 網頁模式（免裝客戶端）

如果你是在朋友的電腦上臨時借用、不想在手機安裝 APK，可以使用 Web 模式：

1. 確保手機與電腦在同一個 Wi-Fi 網路下（防火牆放行規則與上方 Wi-Fi 模式相同）。
2. 在電腦端 MicYou 介面中切換到 **Web** 模式。
3. 電腦端介面會自動產生一個存取 QR Code 與區域網路 URL（如 `http://192.168.1.100:6000`）。
4. 使用手機系統相機或瀏覽器掃描該 QR Code 開啟網頁。
5. 在手機瀏覽器彈出的權限提示中點擊 **「允許使用麥克風」**，網頁即可透過 WebRTC 即時將聲音串流至電腦。

## 4. 連線方式三：USB 資料線模式（極低延遲）

如果你需要玩高要求競技遊戲、或目前處於校園網路/公共 Wi-Fi 導致區域網路不穩定/開啟了 AP 隔離，推薦使用 USB 資料線模式：

### 步驟一：開啟手機 USB 偵錯

1. 開啟手機「設定」>「關於手機」（部分機型在「系統資訊」）。
2. 連續快速點擊「版本號碼」（或「軟體版本」）**7 次**，直到畫面提示已進入開發人員模式。
3. 返回手機「設定」>「系統」或「其他設定」>「開發人員選項」，找到並開啟 **USB 偵錯**。

### 步驟二：連線電腦並授權

1. 使用 USB 資料線將手機與電腦連線。
2. 手機畫面會跳出「允許 USB 偵錯嗎？」的授權視窗，勾選「一律允許透過這台電腦進行偵錯」並點擊確定。

### 步驟三：啟動 USB 傳輸

1. 在電腦端與手機端的 MicYou 中均切換至 **USB** 模式。
2. 點擊連線，即可享受穩定無波動的低延遲音訊傳輸。

> [!NOTE] ADB 執行環境
> MicYou 桌面端會自動偵測並呼叫 ADB 通道。如果系統提示未找到 ADB，可透過套件管理器一鍵安裝：
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

## 5. 在通話 / 遊戲 / 會議軟體中設定麥克風

音訊傳輸建立後，最後一步是在你的目標軟體中選用虛擬麥克風：

1. **檢查 MicYou 電腦端設定**：
   - 將 MicYou 的 **音訊輸出裝置** 選為虛擬音效卡的輸入端：
     - **Windows**：`CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：預設 PipeWire 虛擬節點
2. **設定通訊 / 會議軟體**：
   - 開啟你的通訊軟體（Discord、微信、QQ、騰訊會議、OBS、Steam 語音等），進入聲音/音訊設定。
   - 將 **麥克風（輸入裝置）** 更改為：
     - **Windows**：`CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：PipeWire 對應的 `MicYou` 輸入節點
3. 現在與朋友通話或錄音測試，軟體就會直接拾取手機端傳來的清晰聲音！

## 常見疑難排解與注意事項

### 1. Wi-Fi 模式提示連線失敗或逾時？
- **防火牆攔截**：確保已在 Windows 防火牆或 Linux ufw 中放行 TCP 6000 和 UDP 6001 連接埠。
- **路由器 AP 隔離**：部分公共 Wi-Fi、校園網路或路由器的「訪客模式」開啟了 AP 隔離，禁止區域網路裝置互訪。可以嘗試手機開啟熱點讓電腦連線，或者改用 USB 資料線模式。

### 2. 看到電平在跳動，但在聊天軟體裡沒聲音？
- 確認音訊裝置方向：MicYou 電腦端的輸出應為 **`CABLE Input`**，而第三方軟體的麥克風輸入應為 **`CABLE Output`**。
- 檢查 Windows 系統聲音設定中 `CABLE Output` 是否被靜音或音量過小。

### 3. 手機鎖定螢幕後聲音中斷或斷斷續續？
- 部分 Android 系統的背景激進省電策略會在鎖定螢幕後暫停背景網路與麥克風。
- 請進入手機「設定」>「應用程式管理」>「MicYou」>「電池 / 耗電管理」，設定為 **「無限制」** 或 **「允許完全背景活動」**，並在多工檢視中鎖定 MicYou。

> [!TIP]
> 遇到其他問題？請參閱 [常見問題 (FAQ)](/zh-TW/docs/faq) 獲取更詳細的疑難排解方案。