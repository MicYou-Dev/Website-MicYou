---
title: Android 舊裝置相容構建 - MicYou
description: 為 Android 5.0+ (API 21+) 及老舊 32 位元裝置編譯相容版 MicYou 客戶端，讓閒置手機變身電腦麥克風。
keywords: MicYou Android,Android相容構建,API 21,Android 5.0,老舊裝置,MultiDex,Gradle構建
---

# Android 舊裝置相容構建

MicYou Android 客戶端預設以現代 Android 7.0+ (API 24+) 為基準。如果希望讓家中閒置的 Android 5.0+ (API 21+) 或老舊 32 位元手機重新發揮作用當電腦麥克風，可以透過相容構建流水線進行編譯。

## 環境準備

- **JDK**: JDK 17 或更高版本，並設定好 `JAVA_HOME` 環境變數
- **Android SDK**: 安裝 Android SDK Platform 36 及 Build-Tools 36.0.0+，並設定 `ANDROID_HOME` 環境變數

## 構建命令

### 1. 標準版本（預設）

適用於 Android 7.0+ (API 24+)：

```bash
./gradlew :composeApp:assembleDebug
```

### 2. 相容版本（Android 5.0+ / API 21+）

傳入 `-Pmicyou.androidCompat=api21` 參數即可開啟相容構建模式：

```bash
# Linux / macOS / Bash / Zsh
./gradlew :composeApp:assembleDebug -Pmicyou.androidCompat=api21

# Windows PowerShell (參數含點號，需使用雙引號包裹)
./gradlew :composeApp:assembleDebug "-Pmicyou.androidCompat=api21"
```

構建產生的 APK 檔案位於：
```text
composeApp/build/outputs/apk/debug/composeApp-debug.apk
```

## 相容架構與降級機制

當開啟 `-Pmicyou.androidCompat=api21` 時，Gradle 構建與執行階段會自動無縫切換至相容策略：

### 1. Source Set 原始碼集橋接

針對現代 UI 函式庫在低版本系統上的介面斷層（如 Haze 毛玻璃模糊與 MaterialKolor 取色函式庫），專案採用 Source Set 隔離策略：

```text
composeApp/src/
├── main/          # 核心業務程式碼，統一從橋接套件匯入 (com.lanrhyme.micyou.ui.compose.haze)
├── normal/        # 標準模式：橋接層呼叫現代函式庫 (Haze 1.7+ / MaterialKolor 5.x)
└── compat/        # 相容模式：橋接層採用降級方案 (半透明背景回退 / MaterialKolor 1.7.x)
```

Gradle 在構建時依需求掛載原始碼集，使核心業務無需撰寫大量平台條件分支。

### 2. 執行階段 API 動態降級

針對 Android 底層 API 差異，關鍵模組內建了版本判斷與動態回退防護：

| 模組 | 相容點 | 現代版本行為 (API 24+) | 相容模式降級行為 (API 21-23) |
| --- | --- | --- | --- |
| `AudioEngine.kt` | 取樣格式與讀取 | `PCM_FLOAT`，`read(float[], ..., READ_NON_BLOCKING)` | 回退至 `PCM_16BIT`，採用 3 參數阻塞讀取 |
| `AudioService.kt` | 前台服務 | `startForegroundService()` 帶前台類型 | 回退至 `startService()` + 傳統 `startForeground()` |
| `AudioService.kt` | 通知與喚醒 | 專屬通知管道、`FLAG_IMMUTABLE` | 跳過通知管道，使用 `FLAG_UPDATE_CURRENT` |
| `MicYouTileService` | 狀態列快捷磁貼 | 2 參數版 `startActivityAndCollapse` | 1 參數相容版本 |
| `Application` | 64K 方法數限制 | 高版本 ART 原生 MultiDex 支援 | 反射呼叫 `MultiDex.install()` |
| `ColorScheme` | 動態桌布取色 | Material 3 動態色彩提取 (API 31+) | 回退至靜態預設色盤 |

## 注意事項與已知限制

- **Target API**: 相容模式將 `targetSdk` 設定為 29，適合側載或自用測試，不能直接用於上架 Google Play。
- **效能開銷**: Android 5.x/6.x 裝置晶片與記憶體效能較弱，Compose 介面在極低階裝置上可能略有掉幀，但音訊背景傳輸不受影響。
- **混淆策略**: 相容模式下的 Release 構建預設關閉程式碼混淆，以保證在老舊 Dalvik / ART 虛擬機器上的穩定性。

## 除錯排查

安裝到舊手機後如果遇到閃退或異常，可透過 ADB 抓取執行記錄檔：

```bash
# 過濾 MicYou 核心崩潰與音訊記錄
adb logcat -s MicYouApplication AudioEngine
```
