---
title: Android 低版本相容構建指南 - MicYou
description: MicYou Android 客戶端針對 Android 5.0+ (API 21+) 及老舊 32 位元裝置的相容構建指南與架構機制說明。
keywords: MicYou Android,Android相容構建,API 21,Android 5.0,老舊裝置,MultiDex,Gradle構建
---

# Android 低版本相容構建指南

MicYou Android 客戶端預設目標為 Android 7.0+ (API 24+)。針對 Android 5.0+ (API 21+) 及 32 位元老舊裝置，專案提供了依需求啟用的相容構建模式。

## 環境準備

- **JDK**: JDK 17 或更高版本，並設定 `JAVA_HOME` 環境變數
- **Android SDK**: 需安裝 Android SDK Platform 36 及 Build-Tools 36.0.0+，並設定 `ANDROID_HOME` 環境變數

## 構建命令

### 標準版本（預設）

適用於 Android 7.0+ (API 24+)：

```bash
./gradlew :composeApp:assembleDebug
```

### 相容版本（API 21+ / Android 5.0+）

透過 `-Pmicyou.androidCompat=api21` 參數開啟相容構建模式：

```bash
# Bash / Zsh / Linux / macOS
./gradlew :composeApp:assembleDebug -Pmicyou.androidCompat=api21

# PowerShell (注意參數含點號，必須使用雙引號包裹)
./gradlew :composeApp:assembleDebug "-Pmicyou.androidCompat=api21"
```

構建產生的 APK 路徑：
```text
composeApp/build/outputs/apk/debug/composeApp-debug.apk
```

## 相容架構與降級機制

當指定 `-Pmicyou.androidCompat=api21` 時，構建設定與執行階段會自動切換至相容管線：

### 1. Source Set 橋接層設計

針對依賴函式庫在低版本 API 與現代版本之間的介面斷層（如 Haze 動態模糊與 MaterialKolor），專案採用了 Source Set 橋接策略：

```text
composeApp/src/
├── main/          # 通用業務程式碼，統一從橋接套件匯入（com.lanrhyme.micyou.ui.compose.haze）
├── normal/        # 預設模式：橋接層委託給現代函式庫實作（Haze 1.7+ / MaterialKolor 5.x）
└── compat/        # 相容模式：橋接層採用低版本降級方案（半透明背景回退 / MaterialKolor 1.7.x）
```

Gradle 構建時根據 `-Pmicyou.androidCompat` 參數動態決定將 `normal` 還是 `compat` 目錄掛載為原始碼集，保證 `main/` 業務邏輯無需條件編譯分支。

### 2. 執行階段 API 動態降級

針對 Android 執行階段的 API 差異，核心模組內建了 `Build.VERSION.SDK_INT` 等級的執行階段防護：

| 模組 | 相容點 | 現代版本行為 (API 24+) | 相容版回退行為 (API 21-23) |
| --- | --- | --- | --- |
| `AudioEngine.kt` | 取樣格式與讀取 | `PCM_FLOAT`，`read(float[], ..., READ_NON_BLOCKING)` | 回退至 `PCM_16BIT`，採用 3 參數阻塞讀取 |
| `AudioService.kt` | 前台服務 | `startForegroundService()`，帶類型參數 | 回退至 `startService()` + 傳統 `startForeground()` |
| `AudioService.kt` | 通知與喚醒 | 通知管道、`FLAG_IMMUTABLE`、精確喚醒 | 跳過通知管道，採用 `FLAG_UPDATE_CURRENT` |
| `MicYouTileService` | 快捷磁貼 | 2 參數版 `startActivityAndCollapse` | 1 參數相容版本 |
| `Application` | 64K 方法數 | 高版本 ART 原生 MultiDex | 反射呼叫 `MultiDex.install()` |
| `ColorScheme` | 動態取色 | Material 3 動態色彩角色 (API 31+) | 回退至靜態近似色盤 |

## 已知限制

- **Target API**: 相容模式 `targetSdk` 為 29，主要用於側載或老舊裝置測試，無法直接上架 Google Play。
- **效能**: Android 5.x/6.x 裝置的硬體效能與記憶體較有限，Compose 渲染在極低配裝置上可能存在幀率波動。
- **發布混淆**: 相容模式下的 Release 構建預設關閉混淆以保障老舊 ART/Dalvik 執行穩定性，套件體積相對較大。

## 除錯與排查

安裝至老舊裝置後若出現異常，可透過 ADB 抓取執行記錄檔：

```bash
# 查看崩潰與異常記錄
adb logcat -s MicYouApplication AudioEngine
```
