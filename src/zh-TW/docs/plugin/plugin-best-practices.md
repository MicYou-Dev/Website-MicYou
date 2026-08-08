---
title: MicYou 插件最佳實踐與擴展性
description: 插件架構、安全模型、版本兼容策略與 Android 擴展路線
keywords: MicYou,插件,最佳實踐,安全模型,版本兼容,Android
---


## 為安卓端預留的擴展點

### 協議統一 + 實現分離

插件系統按「協議統一 + 實現分離」設計，安卓端不照搬桌面實現：

- **統一**：Manifest 模型（`plugin.json`）、Host API 能力描述、跨端消息協議（protobuf `PluginMessage`）、總線語義（發佈訂閱 / RPC）兩端共用
- **分離**：插件加載實現（Native 加載器 / WASM 運行時）、宿主接線（HostApi 實現、傳輸適配器）按平臺各自實現

### 桌面端的可複用部分

| 模塊 | 是否可複用於安卓 | 說明 |
| --- | --- | --- |
| `manifest.rs` | 是 | 純 Rust，無平臺依賴 |
| `plugin.rs`（統一抽象） | 是 | 運行時無關的契約 |
| `bus.rs`（PluginBus） | 是 | 純 Rust 邏輯，僅替換 transport |
| `sync.rs`（線協議編解碼） | 是 | 依賴 micyou-protocol |
| `wasm.rs`（wasmi 運行時） | 是 | wasmi 純 Rust，無原生依賴，可直接嵌入 Android JNI |
| `native.rs`（libloading） | 否 | Android 用其他加載方式（見下） |
| `abi.rs` + `micyou_plugin_abi.h` | 參考 | 安卓可另定 JNI 綁定，但保持能力語義一致 |

## 安卓端規劃

### 為什麼不用重型插件化框架

RePlugin / Shadow / VirtualAPK 等動態插件框架面向「應用級插件化」（Activity / Service / 資源 / 熱修復），對 MicYou 屬於過度設計：

- **體積**：框架與打包鏈開銷大，MicYou 是單模塊輕量應用
- **能力不匹配**：插件需求是 DSP 節點、事件、跨端消息，不是頁面跳轉與組件熱插拔
- **安全模型衝突**：框架追求「動態加載任意 APK」，與插件沙箱/能力授權模型不一致
- **維護成本**：與 AGP/Kotlin 版本強綁定，升級成本高

推薦路徑：**協議對齊 → 輕量運行時 → 跨端同步**，加載方式可選（輕量 DEX、受信 .so、WASM），不強制上重型框架

### 分階段路線圖

#### 階段 1：協議對齊（核心）

- 在安卓端實現 `plugin.json` 解析與校驗（可與桌面共享同一份 manifest 描述，Kotlin 側按 proto/JSON schema 對齊）
- 引入 protobuf `PluginMessage` 到安卓的 TCP 控制通道（與桌面 `tcp_server` 對稱）
- 實現輕量 `PluginBus`（發佈訂閱 + RPC 關聯）——語義與桌面 `bus.rs` 一致
- 驗收：安卓客戶端能解析/發送 `PluginMessage`，與桌面端插件完成一次雙向消息往返

#### 階段 2：輕量運行時

- **WASM**：優先（wasmi 可編譯到 Android，純 Rust 無原生依賴，天然沙箱）
- **受信 .so**：面向實時 DSP 場景，走 JNI + 手寫 ABI（或複用桌面 C ABI 頭文件），僅加載受信來源（應用內置 / 官方商店）
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
| Manifest / 能力聲明 | ✅ | ✅ | 同一 schema |
| Host API 邏輯接口 | ✅ | ✅ | 同一語義，不同綁定 |
| WASM 運行時 | ✅ | ✅（規劃） | 同一模塊產物 |
| Native 運行時 | cdylib + libloading | 受信 .so + JNI（規劃） | 加載方式不同 |
| 跨端消息協議 | ✅ | ✅（階段 1） | 同一 protobuf |
| 插件總線（本地） | ✅ | ✅（階段 1） | 同一語義 |
| 插件總線（跨端） | ✅ | ✅（階段 3） | 同一傳輸協議 |
| DSP 鏈節點 | ✅（`Plugins` 鏈節點） | 規劃 | 安卓側處理鏈在 AudioRecord 管線內 |
| UI 按鈕面板（`ui.route=buttons`） | ✅ | 規劃 | 音效板等聲明式面板 |
| 專屬設置頁（`ui.panels`） | ✅ | 規劃 | 沙箱 iframe + postMessage 橋 |
| 全局快捷鍵（register_hotkey） | ✅ | 規劃 | 系統級快捷鍵消息 |
| `audio.play`（播放音效） | ✅ | 規劃 | 安卓可映射到 MediaPlayer |
| 前端管理界面 | ✅（Vue） | 規劃 | Compose 面板 |
| `network.io` / `fs.read` | 預留 | 預留 | — |

## 版本兼容策略

- **Host API 版本**（`apiVersion`）：插件聲明構建時版本，宿主不匹配即拒絕加載（錯誤碼 7），未來新增能力只加不減，保持向後兼容
- **ABI 版本**（Native）：`MPL_ABI_VERSION` 保護結構體佈局；破壞性變更升級 ABI 版本，舊插件按新版本頭重新構建
- **Host 函數表追加式演進**：`mpl_host_api_t` 新字段只能追加在 `ctx` 之後，禁止插入中間——舊佈局插件讀取正確偏移不受影響（實測修復過插入字段導致的段錯誤）
- **minHostVersion**：插件聲明所需最低宿主 API 版本（semver），major 超過宿主版本即拒絕加載
- **WASM 導入表**：新增導入不影響不引用它的舊插件；導入簽名不匹配的調用在宿主側報錯而非崩潰
- **線協議**：`MessageWrapper` 採用 proto3 未知字段兼容——舊客戶端不識別 `pluginMessage` 字段時自動跳過，新字段只在雙方都支持時生效
- **錯誤碼**：wire 錯誤碼（0-12）凍結，新增錯誤只追加
- **配置格式**：`plugin-state.json` 按 id 組織，缺失字段走默認值
- **API 變更流程**：新增能力 = 追加字段 + 新能力名（舊插件不受影響）；破壞性變更 = 升級 `HOST_API_VERSION`，新舊插件並存（按 apiVersion 分發）

## 安全模型

### Native 插件

- 全權進程內執行，等同本地應用代碼——宿主只做「能力授權」與「版本校驗」，不做代碼沙箱
- 安裝來源信任：用戶手動放入插件目錄，或未來接入簽名校驗（預留）
- 實時安全：`realtimeSafe` 聲明是宿主信任依據，違反者造成音頻質量問題由插件負責

### WASM 插件

- **內存沙箱**：wasmi 解釋器，插件無法越界訪問宿主內存
- **燃料計量**：每次入口調用注入固定燃料預算（默認 100 000），死循環被 trap，插件無法掛起宿主
- **能力授權**：所有 host 函數按 manifest capabilities 逐調用校驗，未授權返回 `MPL_ERR_PERMISSION`
- **無系統訪問**：不提供 WASI / 文件 / 網絡導入，需系統能力請用 Native 插件

### 消息安全

- 跨端消息按插件 id 路由，未註冊的 target 返回 unknown plugin
- RPC 帶超時，不會無限阻塞
- 總線事件可廣播到遠端設備——插件需自行評估發佈內容的敏感性

### 審計與日誌

- 插件日誌獨立緩衝（每插件 500 行環形），GUI 可查看
- 宿主日誌記錄插件啟停、加載失敗與錯誤

## 性能預算

- DSP 插件節點：單節點單幀處理建議 < 1 ms（48 kHz / 480 樣本幀）
- WASM DSP：best-effort，禁止聲稱 realtimeSafe
- 插件調度：音頻線程通過 `Arc<Mutex<PluginInstance>>` 持有節點句柄，穩態無鎖競爭（插件僅啟停時變更）
- 總線消息：控制通道容量 100，`try_send` 非阻塞發送，滿則丟棄並報錯
