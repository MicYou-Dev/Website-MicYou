---
title: MicYou 插件开发指南
description: MicYou 插件系统开发快速入门，学习如何创建自定义插件扩展应用功能
keywords: MicYou插件开发,Kotlin插件,Android插件开发,JVM插件,音频插件
---

# MicYou 插件开发指南

MicYou 插件开发快速开始指南。

## 概述

MicYou 插件系统允许开发者扩展应用功能。插件可以：
- 提供自定义 UI 界面（主窗口、对话框或新页面）
- 提供设置页面
- 访问插件专属存储空间
- 访问主机应用状态和控制能力
- 注册自定义音频效果器（降噪、增益等）
- 修改应用设置和音频配置

## 快速开始

### 1. 创建项目

创建一个新的 Kotlin/JVM Gradle 项目：

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

### 2. 实现 Plugin 接口

创建插件主类：

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

        // 访问主机能力
        val host = context.host
        context.log("Platform: ${host.platform.name}")
    }

    override fun onEnable() {
        // 插件启用时调用
    }

    override fun onDisable() {
        // 插件禁用时调用
    }

    override fun onUnload() {
        // 插件卸载时调用
    }
}
```

### 3. 创建 plugin.json

在资源目录创建 `plugin.json`：

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

构建 JAR 文件并打包：

```bash
./gradlew jar

# 创建插件包
mkdir -p plugin-package
cp build/libs/my-plugin.jar plugin-package/plugin.jar
cp src/main/resources/plugin.json plugin-package/
cd plugin-package && zip -r ../my-plugin.micyou-plugin.zip .
```

### 5. 安装插件

1. 打开 MicYou 应用
2. 进入设置 → 插件
3. 点击"导入插件"按钮
4. 选择 `.micyou-plugin.zip` 文件
5. 启用插件

## 核心接口

### Plugin

插件主接口，定义生命周期方法：

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

提供插件运行环境：

```kotlin
interface PluginContext {
    val pluginId: String
    val pluginDataDir: String

    // 本地化接口
    val localization: PluginLocalization
    val appLocalization: PluginLocalization

    // 数据存储
    fun getString(key: String, defaultValue: String): String
    fun putString(key: String, value: String)
    fun getBoolean(key: String, defaultValue: Boolean): Boolean
    fun putBoolean(key: String, value: Boolean)
    fun getInt(key: String, defaultValue: Int): Int
    fun putInt(key: String, value: Int)
    fun getFloat(key: String, defaultValue: Float): Float
    fun putFloat(key: String, value: Float)

    // 日志
    fun log(message: String)
    fun logError(message: String, throwable: Throwable? = null)

    // 主机能力
    val host: PluginHost
}
```

### PluginHost

提供对主机应用的访问能力：

```kotlin
interface PluginHost {
    // 状态流
    val streamState: StateFlow<StreamState>
    val audioLevels: StateFlow<Float>
    val isMuted: StateFlow<Boolean>
    val connectionInfo: StateFlow<ConnectionInfo?>
    val audioConfig: StateFlow<AudioConfig>

    // 音频配置
    fun updateAudioConfig(config: AudioConfig)
    fun updateAudioConfig(block: AudioConfig.() -> AudioConfig)

    // 流控制
    suspend fun startStream(ip: String, port: Int, mode: ConnectionMode, isClient: Boolean)
    suspend fun stopStream()
    suspend fun setMute(muted: Boolean)
    fun setMonitoring(enabled: Boolean)

    // 音频效果注册
    fun registerAudioEffect(effect: AudioEffectProvider, priority: Int = 100)
    fun unregisterAudioEffect(effect: AudioEffectProvider)

    // UI 反馈
    fun showSnackbar(message: String)
    fun showNotification(title: String, message: String)

    // 设置访问
    fun getSetting(key: String, defaultValue: String): String
    fun setSetting(key: String, value: String)
    // ... 其他设置方法

    // 平台信息
    val platform: PlatformInfo
}
```

### PluginUIProvider

提供插件 UI 组件：

```kotlin
interface PluginUIProvider {
    val hasMainWindow: Boolean get() = false
    val hasDialog: Boolean get() = false

    // 窗口配置（桌面端）
    val windowWidth: Dp get() = 600.dp
    val windowHeight: Dp get() = 500.dp
    val windowTitle: String get() = "Plugin Window"
    val windowResizable: Boolean get() = true

    // 移动端 UI 模式
    val mobileUIMode: MobileUIMode get() = MobileUIMode.Dialog

    @Composable
    fun MainWindow(onClose: () -> Unit) {}

    @Composable
    fun DialogContent(onDismiss: () -> Unit) {}
}

enum class MobileUIMode {
    Dialog,     // 对话框模式
    NewScreen   // 新页面模式
}
```

### PluginSettingsProvider

提供插件设置页面：

```kotlin
interface PluginSettingsProvider {
    @Composable
    fun SettingsContent()
}
```

## 进阶功能

### 访问主机状态

```kotlin
class MyPlugin : Plugin {
    private var context: PluginContext? = null

    override fun onLoad(context: PluginContext) {
        this.context = context

        // 获取当前流状态
        val state = context.host.streamState.value
        context.log("Current stream state: $state")

        // 获取音频配置
        val config = context.host.audioConfig.value
        context.log("NS enabled: ${config.enableNS}")
    }
}
```

### 修改音频配置

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

### 注册自定义音频效果

```kotlin
class MyNoiseReducer : AudioEffectProvider {
    override val id = "com.example.myplugin.noise-reducer"
    override val name = "My Noise Reducer"
    override val description = "Custom noise reduction effect"
    override var isEnabled = true

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // 实现降噪算法
        return input
    }

    override fun reset() {
        // 重置内部状态
    }

    override fun release() {
        // 释放资源
    }
}

class MyPlugin : Plugin, AudioEffectPlugin {
    override val audioEffectProvider = MyNoiseReducer()
    override val effectPriority = 50  // 较高优先级

    override fun onLoad(context: PluginContext) {
        // 注册音频效果
        context.host.registerAudioEffect(audioEffectProvider, effectPriority)
    }

    override fun onUnload() {
        context?.host?.unregisterAudioEffect(audioEffectProvider)
    }
}
```

### 显示通知

```kotlin
class MyPlugin : Plugin {
    fun notifyUser() {
        context?.host?.showSnackbar("Operation completed!")
        context?.host?.showNotification("My Plugin", "Background task finished")
    }
}
```

### 读取/修改应用设置

```kotlin
class MyPlugin : Plugin {
    fun readAppSettings() {
        val host = context?.host ?: return

        // 读取应用设置
        val theme = host.getSetting("theme", "system")
        val autoStart = host.getSettingBoolean("autoStart", false)

        // 修改应用设置
        host.setSettingBoolean("autoStart", true)
    }
}
```

## 本地化

插件支持多语言本地化。在资源目录创建 `i18n/` 文件夹：

```
src/main/resources/
└── i18n/
    ├── en.json
    ├── zh-CN.json
    └── ja.json
```

JSON 文件格式：

```json
{
  "plugin.name": "My Plugin",
  "plugin.description": "A sample plugin",
  "settings.title": "Settings",
  "button.save": "Save"
}
```

在代码中使用本地化：

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

## 完整示例

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
        // 设置页面内容
    }
}
```

## 相关文档

- [插件 API 参考](./plugin-api-reference)
- [插件开发最佳实践](./plugin-best-practices)
- [插件包格式规范](./plugin-package-format)