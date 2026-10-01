---
title: 常見問題 - MicYou
description: MicYou 常見問題解答與疑難排解指南。涵蓋 Wi-Fi / USB / Web 連線、音訊路由設定、雜音與回聲消除、背景保活及各作業系統專屬問題。
keywords: MicYou常見問題,MicYou疑難排解,無法連線,沒有聲音,雜音爆音,延遲最佳化,背景保活,VB-CABLE,BlackHole,PipeWire,防火牆
---

# 常見問題

在使用 MicYou 的過程中遇到問題？這裡整理了最常見的問題解答與實用疑難排解步驟。

## 1. 網路與連線排查

### Wi-Fi 模式下手機點擊「連線」提示逾時或連不上

Wi-Fi 模式要求手機和電腦在同一個區域網路內通訊。請依序排查以下三點：

1. **放行電腦防火牆連接埠（最常見）**  
   Windows 防火牆或第三方防毒軟體常會默默攔截傳入連線。MicYou 預設使用 **TCP 6000**（控制指令）與 **UDP 6001**（音訊資料）連接埠。
   - **Windows**：以系統管理員身分開啟 PowerShell，執行以下命令放行連接埠：
     ```powershell
     New-NetFirewallRule -DisplayName "MicYou-6000-TCP" -Direction Inbound -LocalPort 6000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "MicYou-6001-UDP" -Direction Inbound -LocalPort 6001 -Protocol UDP -Action Allow
     ```
   - **Linux**（啟用 `ufw` 時）：
     ```bash
     sudo ufw allow 6000/tcp && sudo ufw allow 6001/udp
     ```

2. **檢查路由器是否開啟了 AP 隔離 / 訪客網路**  
   - 確保手機和電腦連線的是同一台路由器的 Wi-Fi。
   - 在**校園網路、公司公用 Wi-Fi 或租屋共用網路**中，路由器通常開啟了 **AP 隔離（Client Isolation）**，禁止區域網路裝置互相存取。
   - **解決方法**：手機開啟個人熱點讓電腦連線，或直接使用 [USB 資料線模式](/zh-TW/docs/quick-start#方式-b-usb-資料線連線-超低延遲)。

3. **電腦有多張網路卡，選錯了 IP 位址**  
   如果電腦啟用了 WSL、虛擬機器（VMware / VirtualBox）、VPN 或虛擬網路工具（Tailscale / ZeroTier），MicYou 桌面端可能會列出多個虛擬 IP。  
   - 請在 MicYou 桌面端的 IP 下拉選單中，選擇手機可存取的**真實無線區域網路 IP**（通常為 `192.168.x.x` 或 `10.x.x.x`），並確保手機端輸入的 IP 與之相符。

### USB (ADB) 模式提示「未偵測到裝置」或連線失敗

USB 模式透過 ADB 進行本機連接埠代理，連線穩定且延遲極低。如果無法辨識裝置：

1. **確認已開啟 USB 偵錯並完成授權**  
   - 進入手機「設定」>「關於手機」，連續點擊「版本號碼」7 次開啟開發人員選項。
   - 進入「開發人員選項」，開啟 **USB 偵錯**。
   - 插上傳輸線後，手機螢幕會彈出 **「允許 USB 偵錯嗎？」** 提示框，請勾選「一律允許」並點擊確定。

2. **變更 USB 連接用途**  
   插線後在手機下拉通知列中，將 USB 模式從「僅充電」切換為 **「檔案傳輸 (MTP)」** 或 **「相片傳輸 (PTP)」**。部分品牌手機在僅充電模式下會主動關閉 ADB 偵錯介面。

3. **檢查電腦端 ADB 環境**  
   MicYou 桌面端內建了 ADB 呼叫邏輯。你也可以在電腦終端機中執行 `adb devices` 驗證狀態：
   ```bash
   adb devices
   ```
   - 若狀態顯示為 `unauthorized`：表示手機上尚未點擊允許偵錯彈窗，請解鎖手機並確認。
   - 若提示找不到 `adb` 命令，可透過套件管理器一鍵安裝：
     - **Windows**: <Copy text="winget install -e --id Google.PlatformTools" type="info" />
     - **macOS**: <Copy text="brew install android-platform-tools" type="info" />
     - **Ubuntu / Debian**: <Copy text="sudo apt install android-tools-adb" type="info" />
     - **Arch Linux**: <Copy text="sudo pacman -S android-tools" type="info" />

### Web 網頁免安裝模式打不開或無法錄音

1. **手機打不開電腦端顯示的網址**：確認手機與電腦在同一個 Wi-Fi 下，且電腦防火牆已放行對應連接埠。
2. **打得開網頁但沒有聲音傳輸**：
   - 首次開啟網頁時，瀏覽器會彈出麥克風權限請求，必須點擊 **「允許使用麥克風」**。
   - 請使用現代瀏覽器（Chrome、Safari、Edge、Firefox）。請勿在通訊軟體內建掃描器等受限 WebView 中直接使用，建議複製連結到系統瀏覽器中開啟。

## 2. 聲音與音訊設定排查

### 手機與電腦已連線、電平有跳動，但在通訊 / 遊戲軟體裡聽不到聲音？

這是最常見的設定問題，原因通常是**音訊輸入輸出方向設定顛倒**。

::: tip 核心邏輯：輸入與輸出的分工
- **MicYou 桌面端**是音訊的**發送端**：把接收到的手機聲音**輸出**到虛擬音效卡。
- **第三方軟體（Discord / 微信 / QQ / OBS / 遊戲語音）**是音訊的**接收端**：把虛擬音效卡作為**麥克風輸入**。
:::

#### 檢查步驟：

1. **檢查 MicYou 桌面端的「音訊輸出裝置」**：
   - **Windows**：選擇 `CABLE Input (VB-Audio Virtual Cable)`
   - **macOS**：選擇 `BlackHole 2ch`
   - **Linux**：選擇預設 PipeWire 虛擬輸出節點

2. **檢查第三方通訊 / 錄音軟體的「麥克風 / 輸入裝置」**：
   - **Windows**：選擇 `CABLE Output (VB-Audio Virtual Cable)`
   - **macOS**：選擇 `BlackHole 2ch`
   - **Linux**：選擇 PipeWire 對應的 `MicYou` 虛擬麥克風

3. **檢查系統音量設定**：  
   開啟系統聲音控制台，確保 `CABLE Output` 或 `BlackHole` 沒有被靜音，且輸入音量處於 80%~100%。

**Windows 系統聲音裝置設定參考：**

![輸入裝置](/input-device.png)

![輸出裝置](/output-device.png)

**macOS 系統聲音輸入設定參考：**

![macOS 輸入裝置](/macos-sound-zhtw.png)

### 聲音過小、背景雜音明顯或有刺耳嘯叫？

1. **音量偏小**：
   - 在手機端 MicYou 介面調大麥克風收音增益。
   - 在 Windows「聲音設定」>「更多聲音設定」>「錄製」> 點兩下 `CABLE Output` >「等級」中，將音量調至 100。
2. **刺耳嘯叫（回聲反饋）**：
   - 嘯叫是因為電腦喇叭播放的聲音被手機麥克風再次收錄，形成死循環反饋。
   - **解決方法**：配戴耳機收聽電腦聲音；或在 MicYou 桌面端設定中開啟 **AEC (聲學回聲消除)** 與 **PureVox AI 降噪**。
3. **環境雜音大**：
   - 在桌面端開啟 **PureVox AI 降噪** 或語音活動偵測（VAD），可智慧過濾風扇聲、鍵盤敲擊聲與環境雜音。

### 聲音出現雜音、爆音或斷續撕裂？

1. **音訊取樣率不相符（Windows）**：
   - 開啟 Windows 聲音控制台（`mmsys.cpl`）。
   - 分別進入 `CABLE Input`（播放分頁）與 `CABLE Output`（錄製分頁）的「內容」>「進階」。
   - 將「預設格式」統一修改為 **`2 聲道, 16 位元, 48000 Hz`** 或 **`2 聲道, 24 位元, 48000 Hz`**，保持兩端取樣率一致。
2. **Wi-Fi 網路抖動導致封包遺失**：
   - 在 MicYou 桌面端設定中適度加大音訊緩衝區（Buffer Size）。
   - 優先連線至 5GHz Wi-Fi 頻段，避開 2.4GHz 藍牙與微波爐頻段干擾。

### 結束 MicYou 後，電腦自帶麥克風 / 耳機沒有聲音了？

- **macOS**：macOS 在連線時可能會將系統預設輸入裝置切換至 BlackHole。如果軟體意外結束，請手動開啟「系統設定」>「聲音」>「輸入」，切回您的硬體麥克風（如「MacBook Pro 麥克风」或外接耳機）。
- **Windows**：檢查語音軟體中是否將麥克風固定設定為 `CABLE Output`，切回「預設通訊裝置」或您的實體耳機麥克風即可。

## 3. 背景保活與延遲最佳化

### 手機鎖定螢幕或切到背景後，過一會兒聲音就中斷或卡頓？

Android 系統為了省電，在螢幕關閉後會積極凍結背景應用程式的網路與麥克風擷取。請進行以下設定：

1. **關閉電池最佳化 / 設為無限制（最關鍵）**：
   - 進入手機「設定」>「應用程式管理」>「MicYou」>「電池 / 耗電管理 / 省電策略」。
   - 將策略修改為 **「無限制」**（或「允許完全背景執行 / 不受省電策略限制」）。
2. **在多工背景中加鎖**：
   - 開啟手機的多工卡片列表，長按或下拉 MicYou 卡片，點擊「鎖頭」圖示將其鎖定，防止被一鍵清理。
3. **保持前景常駐通知**：
   - 確保允許 MicYou 顯示常駐通知列訊息，這是 Android 系統保證背景服務不被系統回收的核心機制。

### 玩競技遊戲對延遲要求極高，如何把延遲降到最低？

1. **優先使用 USB 資料線模式**：USB 傳輸完全不受無線網路抖動影響，延遲可穩定在 10ms 以內。
2. **Wi-Fi 模式最佳化**：
   - 電腦盡量使用實體網路線直連路由器，手機連線至 5GHz 頻段 Wi-Fi。
   - 在網路穩定的情況下，進入 MicYou 設定將音訊緩衝區調至更小數值。

## 4. 作業系統專屬問題

### Windows：安裝 VB-CABLE 驅動程式後仍無法辨識

- 安裝時必須解壓縮 ZIP 壓縮套件，在 `VBCABLE_Setup_x64.exe` 上按右鍵並選擇 **「以系統管理員身分執行」**。
- 安裝完成後**必須重新啟動電腦**，驅動程式才會被 Windows 音訊核心服務載入。

### macOS：提示「無法打開，因為無法驗證開發者」

- 首次開啟若被 Gatekeeper 攔截，進入 macOS「系統設定」>「隱私權與安全性」，滑至底部找到 MicYou 的攔截提示，點擊 **「仍要開啟」**。
- 在「隱私權與安全性」>「麥克風」中，確保已勾選允許 MicYou 存取。

### Linux：客戶端開啟後出現白畫面、黑畫面或視窗透明

部分搭載 NVIDIA 顯示卡或特定 WebKitGTK 版本的 Linux 發行版在啟用 DMA-BUF 硬體加速渲染時可能出現視窗異常。

可透過附加參數啟動軟體渲染：
```bash
MicYou --software-rendering
```

或設定環境變數停用 DMA-BUF 渲染器：
```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
MicYou
```

### Linux：PipeWire 未辨識到虛擬輸入節點

MicYou 原生支援 PipeWire 音訊架構。如果系統未出現虛擬節點，請檢查 PipeWire 服務狀態：
```bash
systemctl --user status pipewire pipewire-pulse
```

## 5. 插件與老舊機型

### 插件載入失敗或啟用插件後音訊卡頓爆音？

1. **插件載入失敗**：請檢查插件架構是否與目前系統相符（如 x86_64 / arm64 / WASM），以及 `plugin.json` 中宣告的 `apiVersion` 是否與目前 MicYou 版本相容。
2. **聲音異常或卡頓**：即時音訊 DSP 插件如果在主音訊執行緒進行耗時 I/O 或堆積記憶體配置會導致掉幀。建議在「設定」>「插件」中先停用該插件，並點擊卡片上的「查看日誌」定位問題。

### Android 5.0 / 6.0 等老舊手機能當麥克風使用嗎？

可以！MicYou 官方 Release 版本預設相容 Android 7.0+ (API 24+)。針對閒置的 Android 5.0+ (API 21+) 老舊手機，專案專門提供了相容構建流水線。

你可以前往下載頁面取得相容套件，或參考 [Android 舊裝置相容構建](/zh-TW/docs/android-compat) 自行編譯安裝。