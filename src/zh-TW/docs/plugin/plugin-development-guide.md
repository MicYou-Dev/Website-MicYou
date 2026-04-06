---
title: MicYou 插件開發指南
description: MicYou 插件系統開發快速入門，學習如何建立自訂插件擴充應用功能
keywords: MicYou插件開發,Kotlin插件,Android插件開發,JVM插件,音訊插件
---

# MicYou 插件開發指南

MicYou 插件開發快速開始指南。

## 概述

MicYou 插件系統允許開發者擴充應用功能。插件可以：
- 提供自訂 UI 界面（主視窗、對話框或新頁面）
- 提供設定頁面
- 存取插件專屬儲存空間
- 存取主機應用狀態和控制能力
- 註冊自訂音訊效果器（降噪、增益等）
- 修改應用設定和音訊配置

## 快速開始

### 1. 建立專案

建立一個新的 Kotlin/JVM Gradle 專案：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    kotlin("plugin.compose") version "2.2.20"
    id("org.jetbrains.compose") version "1.7.3"
}

group = "com.example"
version = "1.0.0"

repositories {
    mavenCentral()
    google()
}

dependencies {
    compileOnly(files("path/to/plugin-api-jvm.jar"))
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")

    // Compose
    implementation(compose.runtime)
    implementation(compose.foundation)
    implementation(compose.material3)
    implementation(compose.ui)
}
```

### 2. 實作 Plugin 介面

建立插件主類別：

```kotlin
package com.example.myplugin

import com.lanrhyme.micyou.plugin.*

class MyPlugin : Plugin {
    override val manifest = PluginManifest(
        id = "com.example.myplugin",
        name = "My Plugin",
        version = "1.0.0",
        author = "Your Name",
        description = "A sample plugin for MicYou",
        minApiVersion = "1.0.0",
        mainClass = "com.example.myplugin.MyPlugin"
    )

    override fun onLoad(context: PluginContext) {
        context.log("Plugin loaded!")

        // 存取主機能力
        val host = context.host
        context.log("Platform: ${host.platform.name}")
    }

    override fun onEnable() {
        // 插件啟用時呼叫
    }

    override fun onDisable() {
        // 插件停用時呼叫
    }

    override fun onUnload() {
        // 插件卸載時呼叫
    }
}
```

### 3. 建立 plugin.json

在資源目錄建立 `plugin.json`：

```json
{
  "id": "com.example.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A sample plugin for MicYou",
  "minApiVersion": "1.0.0",
  "mainClass": "com.example.myplugin.MyPlugin"
}
```

### 4. 打包插件

建置 JAR 檔案並打包：

```bash
./gradlew jar

# 建立插件包
mkdir -p plugin-package
cp build/libs/my-plugin.jar plugin-package/plugin.jar
cp src/main/resources/plugin.json plugin-package/
cd plugin-package && zip -r ../my-plugin.micyou-plugin.zip .
```

### 5. 安裝插件

1. 開啟 MicYou 應用
2. 進入設定 → 插件
3. 點擊「匯入插件」按鈕
4. 選擇 `.micyou-plugin.zip` 檔案
5. 啟用插件

## 核心介面

### Plugin

插件主介面，定義生命周期方法：

```kotlin
interface Plugin {
    val manifest: PluginManifest
    fun onLoad(context: PluginContext) {}
    fun onEnable() {}
    fun onDisable() {}
    fun onUnload() {}
}
```

### PluginContext

提供插件執行環境：

```kotlin
interface PluginContext {
    val pluginId: String
    val pluginDataDir: String

    // 本地化介面
    val localization: PluginLocalization
    val appLocalization: PluginLocalization

    // 資料儲存
    fun getString(key: String, defaultValue: String): String
    fun putString(key: String, value: String)
    fun getBoolean(key: String, defaultValue: Boolean): Boolean
    fun putBoolean(key: String, value: Boolean)
    fun getInt(key: String, defaultValue: Int): Int
    fun putInt(key: String, value: Int)
    fun getFloat(key: String, defaultValue: Float): Float
    fun putFloat(key: String, value: Float)

    // 日誌
    fun log(message: String)
    fun logError(message: String, throwable: Throwable? = null)

    // 主機能力
    val host: PluginHost
}
```

### PluginHost

提供對主機應用的存取能力：

```kotlin
interface PluginHost {
    // 狀態流
    val streamState: StateFlow<StreamState>
    val audioLevels: StateFlow<Float>
    val isMuted: StateFlow<Boolean>
    val connectionInfo: StateFlow<ConnectionInfo?>
    val audioConfig: StateFlow<AudioConfig>

    // 音訊配置
    fun updateAudioConfig(config: AudioConfig)
    fun updateAudioConfig(block: AudioConfig.() -> AudioConfig)

    // 流控制
    suspend fun startStream(ip: String, port: Int, mode: ConnectionMode, isClient: Boolean)
    suspend fun stopStream()
    suspend fun setMute(muted: Boolean)
    fun setMonitoring(enabled: Boolean)

    // 音訊效果註冊
    fun registerAudioEffect(effect: AudioEffectProvider, priority: Int = 100)
    fun unregisterAudioEffect(effect: AudioEffectProvider)

    // UI 反饋
    fun showSnackbar(message: String)
    fun showNotification(title: String, message: String)

    // 設定存取
    fun getSetting(key: String, defaultValue: String): String
    fun setSetting(key: String, value: String)
    // ... 其他設定方法

    // 平台資訊
    val platform: PlatformInfo
}
```

### PluginUIProvider

提供插件 UI 元件：

```kotlin
interface PluginUIProvider {
    val hasMainWindow: Boolean get() = false
    val hasDialog: Boolean get() = false

    // 視窗配置（桌面端）
    val windowWidth: Dp get() = 600.dp
    val windowHeight: Dp get() = 500.dp
    val windowTitle: String get() = "Plugin Window"
    val windowResizable: Boolean get() = true

    // 行動端 UI 模式
    val mobileUIMode: MobileUIMode get() = MobileUIMode.Dialog

    @Composable
    fun MainWindow(onClose: () -> Unit) {}

    @Composable
    fun DialogContent(onDismiss: () -> Unit) {}
}

enum class MobileUIMode {
    Dialog,     // 對話框模式
    NewScreen   // 新頁面模式
}
```

### PluginSettingsProvider

提供插件設定頁面：

```kotlin
interface PluginSettingsProvider {
    @Composable
    fun SettingsContent()
}
```

## 進階功能

### 存取主機狀態

```kotlin
class MyPlugin : Plugin {
    private var context: PluginContext? = null

    override fun onLoad(context: PluginContext) {
        this.context = context

        // 取得目前串流狀態
        val state = context.host.streamState.value
        context.log("Current stream state: $state")

        // 取得音訊配置
        val config = context.host.audioConfig.value
        context.log("NS enabled: ${config.enableNS}")
    }
}
```

### 修改音訊配置

```kotlin
class MyPlugin : Plugin {
    fun enableCustomNoiseReduction() {
        context?.host?.updateAudioConfig { config ->
            config.copy(
                enableNS = true,
                nsType = NoiseReductionType.RNNoise
            )
        }
    }
}
```

### 註冊自訂音訊效果

```kotlin
class MyNoiseReducer : AudioEffectProvider {
    override val id = "com.example.myplugin.noise-reducer"
    override val name = "My Noise Reducer"
    override val description = "Custom noise reduction effect"
    override var isEnabled = true

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // 實作降噪演算法
        return input
    }

    override fun reset() {
        // 重置內部狀態
    }

    override fun release() {
        // 釋放資源
    }
}

class MyPlugin : Plugin, AudioEffectPlugin {
    override val audioEffectProvider = MyNoiseReducer()
    override val effectPriority = 50  // 較高優先級

    override fun onLoad(context: PluginContext) {
        // 註冊音訊效果
        context.host.registerAudioEffect(audioEffectProvider, effectPriority)
    }

    override fun onUnload() {
        context?.host?.unregisterAudioEffect(audioEffectProvider)
    }
}
```

###顯示通知

```kotlin
class MyPlugin : Plugin {
    fun notifyUser() {
        context?.host?.showSnackbar("Operation completed!")
        context?.host?.showNotification("My Plugin", "Background task finished")
    }
}
```

### 讀取/修改應用設定

```kotlin
class MyPlugin : Plugin {
    fun readAppSettings() {
        val host = context?.host ?: return

        // 讀取應用設定
        val theme = host.getSetting("theme", "system")
        val autoStart = host.getSettingBoolean("autoStart", false)

        // 修改應用設定
        host.setSettingBoolean("autoStart", true)
    }
}
```

## 本地化

插件支援多語言本地化。在資源目錄建立 `i18n/` 資料夾：

```
src/main/resources/
└── i18n/
    ├── en.json
    ├── zh-CN.json
    └── ja.json
```

JSON 檔案格式：

```json
{
  "plugin.name": "My Plugin",
  "plugin.description": "A sample plugin",
  "settings.title": "Settings",
  "button.save": "Save"
}
```

在程式碼中使用本地化：

```kotlin
class MyPlugin : Plugin, PluginLocalizationProvider {
    override fun getLocalizedString(languageCode: String, key: String): String? {
        return when (languageCode) {
            "zh" -> zhStrings[key]
            "en" -> enStrings[key]
            else -> null
        }
    }

    override fun getSupportedLanguages(): List<String> {
        return listOf("zh", "en")
    }
}
```

## 完整範例

```kotlin
class MyPlugin : Plugin, PluginUIProvider, PluginSettingsProvider {
    private var context: PluginContext? = null

    override val manifest = PluginManifest(
        id = "com.example.myplugin",
        name = "My Plugin",
        version = "1.0.0",
        author = "Your Name",
        description = "A plugin with UI and settings",
        minApiVersion = "1.0.0",
        mainClass = "com.example.myplugin.MyPlugin"
    )

    // PluginUIProvider
    override val hasMainWindow = true
    override val windowWidth = 700.dp
    override val windowHeight = 500.dp
    override val windowTitle = "My Plugin"
    override val mobileUIMode = MobileUIMode.NewScreen

    @Composable
    override fun MainWindow(onClose: () -> Unit) {
        val host = context?.host
        val streamState by host?.streamState?.collectAsState()
            ?: remember { mutableStateOf(StreamState.Idle) }

        Column(modifier = Modifier.padding(16.dp)) {
            Text("Stream State: $streamState")
            Button(onClick = { host?.showSnackbar("Hello!") }) {
                Text("Show Message")
            }
        }
    }

    // PluginSettingsProvider
    @Composable
    override fun SettingsContent() {
        // 設定頁面內容
    }
}
```

## 相關文檔

- [插件 API 參考](./plugin-api-reference)
- [插件開發最佳實踐](./plugin-best-practices)
- [插件包格式規範](./plugin-package-format)