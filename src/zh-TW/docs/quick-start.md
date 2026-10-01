---
title: 快速開始 - MicYou
description: 快速上手 MicYou。透過 Wi-Fi、USB 資料線或 Web 網頁將手機麥克風低延遲串流到電腦，並在 Discord、微信、QQ、OBS 等軟體中作為麥克風使用。
keywords: MicYou,手機麥克風,電腦麥克風,Wi-Fi連線,Web麥克風,ADB連線,虛擬音效卡,VB-CABLE,BlackHole,PipeWire,防火牆設定
---

# 快速開始

只需簡單幾步，即可把手機麥克風串流至電腦，當作高音質獨立麥克風使用。

## 1. 準備工作

### 步驟一：安裝電腦端與虛擬音效卡

電腦上的軟體（如 Discord、微信、遊戲語音）需要透過**虛擬音效卡驅動程式**來接收手機傳來的音訊流：

1. **下載並安裝 MicYou 電腦端**：前往 [下載頁面](/zh-TW/download) 獲取對應作業系統的安裝套件（Windows / macOS / Linux）。
2. **安裝虛擬音效卡驅動程式**：
   - **Windows**：前往 [VB-Audio 官網](https://vb-audio.com/Cable/) 下載免費的 **VB-CABLE Driver**。解壓縮後按右鍵選擇「以系統管理員身分執行」`VBCABLE_Setup_x64.exe`，安裝完成後**建議重新啟動一次電腦**。
   - **macOS**：建議使用 Homebrew 安裝開源的 BlackHole 虛擬音效卡：
     ```bash
     brew install blackhole-2ch --cask
     ```
     > 安裝後若首次開啟提示未受信任，前往「系統設定」>「隱私權與安全性」點擊「仍要開啟」。
   - **Linux**：MicYou 原生適配 **PipeWire**，啟動後會自動建立虛擬音訊輸入節點，無需額外安裝驅動程式。

### 步驟二：準備手機端

根據使用場景選擇適合你的方式：

- **App 方式（推薦）**：在 [下載頁面](/zh-TW/download) 下載安裝 MicYou Android 客戶端（`.apk`）。首次開啟時請授予麥克風錄音權限。
- **Web 網頁免安裝**：無需安裝任何 App，直接用手機瀏覽器掃描 QR Code 即可使用（適合臨時借用電腦）。

## 2. 選擇連線方式

### 方式 A：Wi-Fi 區域網路連線（無線首選）

無需插線，設定最快，適合日常聊天、會議與線上課程。

1. **連入同一區域網路**：確保手機和電腦連線到同一個 Wi-Fi（同一台路由器）。
2. **放行電腦防火牆**：
   - Windows 首次啟動 MicYou 跳出防火牆視窗時，務必勾選「私人網路」與「公用網路」並允許存取。
   - 若先前誤點了取消或連線逾時，以系統管理員身分執行 PowerShell 執行以下命令放行連接埠：
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
     > Linux 使用者若啟用了 `ufw`，可執行：`sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp`
3. **建立連線**：
   - 電腦端開啟 MicYou，選擇 **Wi-Fi** 模式，介面會顯示電腦的區域網路 IP 與連接埠。
   - 手機端開啟 MicYou App，輸入對應的 IP 和連接埠，點擊「連線」。
   - 對著手機說話，觀察電腦端 MicYou 介面上的音量電平跳動，即代表音訊傳輸成功！

### 方式 B：USB 資料線連線（超低延遲）

不受 Wi-Fi 訊號波動影響，延遲穩定在 10ms 以內，適合對低延遲要求極高的競技遊戲或受限網路（如校園網路 / 開啟了 AP 隔離的網路）。

1. **開啟手機 USB 偵錯**：
   - 進入手機「設定」>「關於手機」，連續點擊「版本號碼」**7 次**進入開發人員模式。
   - 返回「設定」>「系統 / 更多設定」>「開發人員選項」，開啟 **USB 偵錯**。
2. **連線電腦並授權**：
   - 用傳輸線將手機連至電腦。
   - 手機彈出「允許 USB 偵錯嗎？」時，勾選「一律允許」並點擊確定。
3. **開始串流**：
   - 電腦端與手機端的 MicYou 均切換到 **USB** 模式並點擊連線。

> [!NOTE] ADB 執行環境
> MicYou 桌面端會自動呼叫 ADB。若系統提示未找到 ADB，可透過套件管理器一鍵安裝：
> - Windows: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
> - macOS: <Copy text="brew install android-platform-tools" type="info" />
> - Ubuntu / Debian: <Copy text="sudo apt install android-tools-adb" type="info" />
> - Arch Linux: <Copy text="sudo pacman -S android-tools" type="info" />

### 方式 C：Web 網頁免安裝連線

無需在手機安裝 APK，適合在他人的電腦上臨時應急使用。

1. 確保手機與電腦在同一 Wi-Fi 網路下（防火牆規則同 Wi-Fi 模式）。
2. 電腦端 MicYou 切換到 **Web** 模式，介面會產生存取 QR Code 與區域網路連結。
3. 手機使用內建相機或現代瀏覽器（Chrome、Safari、Edge 等）掃描 QR Code 開啟網頁。
4. 網頁請求錄音權限時點擊 **「允許使用麥克風」**，音訊即透過 WebRTC 即時串流到電腦。

## 3. 在通訊 / 會議 / 遊戲軟體中選用麥克風

音訊連線建立後，只需在目標軟體中將麥克風指向虛擬音效卡：

1. **確認 MicYou 電腦端輸出設定**：
   - **音訊輸出裝置** 選擇虛擬音效卡的輸入端：
     - **Windows**：`CABLE Input (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：預設 PipeWire 虛擬輸出節點
2. **在目標軟體中設定輸入裝置**：
   - 開啟通訊軟體（Discord、微信、QQ、騰訊會議、OBS、Steam 語音等）的音訊設定。
   - 將 **麥克風（音訊輸入）** 選為：
     - **Windows**：`CABLE Output (VB-Audio Virtual Cable)`
     - **macOS**：`BlackHole 2ch`
     - **Linux**：PipeWire 對應的 `MicYou` 虛擬麥克風
3. 現在對手機說話，目標軟體就能直接收錄到清晰的麥克風聲音了！

## 4. 常見疑難排解與使用建議

- **Wi-Fi 模式連不上？**  
  檢查電腦防火牆是否放行了 TCP 6000 和 UDP 6001。公共 Wi-Fi 或校園網路往往開啟了「AP 隔離」，禁止裝置互聯，此時建議切換為 USB 資料線連線或開啟手機熱點。
- **電平有跳動，但聊天軟體裡聽不到聲音？**  
  重點檢查輸入輸出方向：MicYou 電腦端的輸出應為 **`CABLE Input`**，而第三方軟體的麥克風輸入應為 **`CABLE Output`**。
- **手機鎖定螢幕後聲音斷開？**  
  部分 Android 系統會在鎖定螢幕後強制凍結背景網路和麥克風。請在手機「設定」>「應用程式管理」>「MicYou」>「電池 / 耗電管理」中設為 **「無限制」**（允許完全背景執行），並在多工切換介面鎖定 MicYou。

> [!TIP]
> 遇到其他問題？請參閱 [常見問題 (FAQ)](/zh-TW/docs/faq) 獲取更全面的排查方法。