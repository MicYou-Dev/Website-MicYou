---
title: MicYou 插件最佳實踐與擴展性
description: 插件架構、安全模型、版本兼容策略與 Android 擴展路線
keywords: MicYou,插件,最佳實踐,安全模型,版本兼容,Android
---

# 插件最佳實踐與擴展性

## 為安卓端預留的擴展點

### 協議統一 + 實現分離

插件系統按「協議統一 + 實現分離」設計，安卓端不照搬桌面實現：

- **統一**：Manifest 模型（[`plugin.json`](/zh-TW/docs/plugin/plugin-package-format)）、[Host API 能力描述](/zh-TW/docs/plugin/plugin-api-reference)、跨端消息協議（protobuf `PluginMessage`，見[插件系統總覽](/zh-TW/docs/plugin/plugin-overview#跨端同步模型)）、總線語義（發佈訂閱 / RPC）兩端共用
- **分離**：插件加載實現（Native 加載器 / WASM 運行時）、宿主接線（HostApi 實現、傳輸適配器）按平臺各自實現

### 桌面端的可複用部分

| 模塊 | 是否可複用於安卓 | 说明 |
| --- | --- | --- |
| `manifest.rs` | 是 | 純 Rust，無平臺依賴 |
| `plugin.rs`（統一抽象） | 是 | 運行時無關的契約 |
| `bus.rs`（PluginBus） | 是 | 純 Rust 邏輯，僅替換 transport |
| `sync.rs`（線協議編解碼） | 是 | 依賴 micyou-protocol |
| `wasm.rs`（wasmi 運行時） | 是 | wasmi 純 Rust，無原生依賴，可直接嵌入 Android JNI |
| `native.rs`（libloading） | 否 | Android 用其他加載方式（見下） |
| `abi.rs` + `micyou_plugin_abi.h` | 參考 | 安卓可另定 JNI 綁定，但保持能力語義一致（詳見 [API 參考](/zh-TW/docs/plugin/plugin-api-reference#c-abi-聲明-micyou_plugin_abih)） |

## 安卓端規劃

### 為什麼不用重型插件化框架

RePlugin / Shadow / VirtualAPK 等動態插件框架面向「應用級插件化」（Activity / Service / 資源 / 熱修復），對 MicYou 屬於過度設計：

- **體積**：框架與打包鏈開銷大，MicYou 是單模塊輕量應用
- **能力不匹配**：插件需求是 [DSP 節點](/zh-TW/docs/plugin/plugin-development-guide#實時-dsp-插件規範)、事件、跨端消息，不是頁面跳轉與組件熱插拔
- **安全模型衝突**：框架追求「動態加載任意 APK」，與插件沙箱/能力授權模型不一致
- **維護成本**：與 AGP/Kotlin 版本強綁定，升級成本高（詳見 [Android 相容構建](/zh-TW/docs/android-compat)）

推薦路徑：**協議對齊 → 輕量運行時 → 跨端同步**，加載方式可選（輕量 DEX、受信 .so、WASM），不強制上重型框架

### 分階段路線圖

#### 階段 1：協議對齊（核心）

- 在安卓端實現 [`plugin.json`](/zh-TW/docs/plugin/plugin-package-format) 解析與校驗（可與桌面共享同一份 manifest 描述，Kotlin 側按 proto/JSON schema 對齊）
- 引入 protobuf `PluginMessage` 到安卓的 TCP 控制通道（與桌面 `tcp_server` 對稱）
- 實現輕量 `PluginBus`（發佈訂閱 + RPC 關聯）——語義與桌面 `bus.rs` 一致
- 驗收：安卓客戶端能解析/發送 `PluginMessage`，與桌面端插件完成一次雙向消息往返

#### 階段 2：輕量運行時

- **WASM**：優先（wasmi 可編譯到 Android，純 Rust 無原生依賴，天然沙箱）
- **受信 .so**：面向實時 DSP 場景，走 JNI + 手寫 ABI（或複用桌面 C ABI 頭文件），僅加載受信來源（應用內置 / [官方商店](/zh-TW/docs/plugin/plugin-marketplace-policy)）
- **輕量 DEX**：工具類插件可選，用 `PathClassLoader` 隔離加載，不做 Activity/資源插件化
- 驗收：安卓端可啟用一個 WASM 工具插件與一個受信 .so DSP 插件

#### 階段 3：跨端同步

- 接入與桌面一致的 `PluginMessage` 路由（本地分發 + 遠端轉發）
- 兩端插件互發現（通過總線廣播插件清單）
- 典型場景落地：手機傳感器 → 電腦處理 → 回傳
- 驗收：雙向 RPC 與訂閱推送端到端可用

### 能力矩陣（兩端對齊）

| 能力 | 桌面 | 安卓 | 說明 |
| --- | --- | --- | --- |
| Manifest / 能力聲明 | ✅ | ✅ | 同一 schema，見[套件格式規範](/zh-TW/docs/plugin/plugin-package-format) |
| Host API 邏輯接口 | ✅ | ✅ | 同一語義，不同綁定，見 [API 參考](/zh-TW/docs/plugin/plugin-api-reference) |
| WASM 運行時 | ✅ | ✅（規劃） | 同一模塊產物，見[開發指南](/zh-TW/docs/plugin/plugin-development-guide#編寫-wasm-插件) |
| Native 運行時 | cdylib + libloading | 受信 .so + JNI（規劃） | 加載方式不同，見[開發指南](/zh-TW/docs/plugin/plugin-development-guide#編寫-native-插件) |
| 跨端消息協議 | ✅ | ✅（階段 1） | 同一 protobuf |
| 插件總線（本地） | ✅ | ✅（階段 1） | 同一語義 |
| 插件總线（跨端） | ✅ | ✅（階段 3） | 同一傳輸協議，見[總覽](/zh-TW/docs/plugin/plugin-overview#跨端同步模型) |
| DSP 鏈節點 | ✅（[`Plugins` 鏈節點](/zh-TW/docs/plugin/plugin-overview#與-dsp-音頻鏈路的關係)） | 規劃 | 安卓側處理鏈在 AudioRecord 管線內 |
| UI 按鈕面板（`ui.route=buttons`） | ✅ | 規劃 | 音效板等聲明式面板，見[音效板範例](/zh-TW/docs/plugin/plugin-development-guide#音效板native-soundpad按鈕面板--專屬設置頁--快捷鍵--音頻播放) |
| 專屬設置頁（`ui.panels`） | ✅ | 規劃 | 沙箱 iframe + postMessage 橋，見[設置頁指南](/zh-TW/docs/plugin/plugin-development-guide#編寫插件專屬設置頁uipanels) |
| 全局快捷鍵（`register_hotkey`） | ✅ | 規劃 | 系統級快捷鍵消息，見[快捷鍵使用](/zh-TW/docs/plugin/plugin-development-guide#使用全局快捷鍵) |
| `audio.play`（播放音效） | ✅ | 規劃 | 安卓可映射到 MediaPlayer |
| 前端管理界面 | ✅（Vue） | 規劃 | Compose 面板，見[使用者指南](/zh-TW/docs/plugin/plugin-user-guide#在-gui-中管理插件) |
| `network.io` / `fs.read` | 預留 | 預留 | — |

## 版本相容與解耦策略

- **Host API 版本**（`apiVersion`）：宿主支援版本區間協商（目前 `MIN_SUPPORTED_API_VERSION = 1`，`HOST_API_VERSION = 2`），宣告為 v1 或 v2 的插件均可平滑載入，超出支援範圍才會拒絕載入（錯誤碼 7，詳見 [API 參考錯誤碼](/zh-TW/docs/plugin/plugin-api-reference#錯誤碼)）
- **ABI 版本**（Native）：`MPL_ABI_VERSION`（目前為 1）保護結構體基礎版面配置；破壞性變更才會升級 ABI 版本
- **Host 函數表追加式演進**：`mpl_host_api_t` 新欄位（如 API v2 的控制面系列介面）嚴格追加在 `ctx` 之後，禁止插入中間——舊版 Native 插件讀取已有欄位的偏移保持不變，無需重新編譯
- **生命週期解耦**：插件執行階段與 GUI 介面徹底解耦，無論在 GUI、CLI 還是 TUI 啟動伺服器端，核心啟動流程均會自動載入並執行已啟用的插件，支援無周邊環境運行
- **minHostVersion**：插件宣告所需最低宿主 API 版本（semver），major 超過宿主版本即拒絕載入
- **WASM 匯入表**：新增匯入不影響不引用它的舊插件；匯入簽章不相符的呼叫在宿主端報錯而非當機
- **線路通訊協定**：`MessageWrapper` 採用 proto3 未知欄位相容——舊客戶端不識別 `pluginMessage` 欄位時自動略過，新欄位只在雙方都支援時生效
- **錯誤碼**：wire 錯誤碼（0-12）凍结，新增錯誤只追加
- **設定格式**：`plugin-state.json` 按 id 組織，缺失欄位套用預設值
- **API 變更流程**：新增能力 = 追加欄位 + 新能力名（舊插件不受影响）；破壞性變更 = 升級 `HOST_API_VERSION`，新舊插件並存（按 apiVersion 分發）

## 安全模型

### Native 插件

- 全權進程內執行，等同本地應用代碼——宿主只做「能力授權」與「版本校驗」，不做代碼沙箱
- 安裝來源信任：用戶手動放入插件目錄，或未來接入簽名校驗（預留，見[市場準入政策](/zh-TW/docs/plugin/plugin-marketplace-policy)）
- 實時安全：`realtimeSafe` 聲明是宿主信任依據，違反者造成音頻質量問題由插件負責（詳見[實時 DSP 規範](/zh-TW/docs/plugin/plugin-development-guide#實時-dsp-插件規範)）

### WASM 插件

- **內存沙箱**：wasmi 解釋器，插件無法越界訪問宿主內存
- **燃料計量**：每次入口調用注入固定燃料預算（默認 100 000），死循環被 trap，插件無法掛起宿主
- **能力授權**：所有 host 函數按 manifest [capabilities 權限清單](/zh-TW/docs/plugin/plugin-api-reference#權限清單)逐調用校驗，未授權返回 `MPL_ERR_PERMISSION`
- **無系統訪問**：不提供 WASI / 文件 / 網絡導入，需系統能力請用 Native 插件

### 消息安全

- 跨端消息按插件 id 路由，未註冊的 target 返回 unknown plugin
- RPC 帶超時，不会無限阻塞
- 總線事件可廣播到遠端設備——插件需自行評估發佈內容的敏感性

### 審計與日誌

- 插件日誌獨立緩衝（每插件 500 行環形），GUI 可在[插件管理面板](/zh-TW/docs/plugin/plugin-user-guide#在-gui-中管理插件)查看
- 宿主日誌記錄插件啟停、加載失敗與錯誤

## 性能預算

- DSP 插件節點：單節點單幀處理建議 < 1 ms（48 kHz / 480 樣本幀，詳見[開發指南](/zh-TW/docs/plugin/plugin-development-guide#實時-dsp-插件規範)）
- WASM DSP：best-effort，禁止聲稱 realtimeSafe
- 插件調度：音頻線程通過 `Arc<Mutex<PluginInstance>>` 持有節點句柄，穩態無鎖競爭（插件僅啟停時變更）
- 總線消息：控制通道容量 100，`try_send` 非阻塞發送，滿則丟棄並報錯
