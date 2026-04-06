---
title: MicYou Plugin Development Guide
description: Quick start guide for MicYou plugin system development, learn how to create custom plugins to extend app functionality
keywords: MicYou plugin development,Kotlin plugin,Android plugin development,JVM plugin,audio plugin
---

# MicYou Plugin Development Guide

Quick start guide for MicYou plugin development.

## Overview

The MicYou plugin system allows developers to extend application functionality. Plugins can:
- Provide custom UI interfaces (main window, dialog, or new screen)
- Provide settings pages
- Access plugin-specific storage space
- Access host application state and control capabilities
- Register custom audio effects (noise reduction, gain, etc.)
- Modify application settings and audio configuration

## Quick Start

### 1. Create Project

Create a new Kotlin/JVM Gradle project:

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

### 2. Implement Plugin Interface

Create the plugin main class:

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

        // Access host capabilities
        val host = context.host
        context.log("Platform: ${host.platform.name}")
    }

    override fun onEnable() {
        // Called when plugin is enabled
    }

    override fun onDisable() {
        // Called when plugin is disabled
    }

    override fun onUnload() {
        // Called when plugin is unloaded
    }
}
```

### 3. Create plugin.json

Create `plugin.json` in the resources directory:

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

### 4. Package Plugin

Build JAR file and package:

```bash
./gradlew jar

# Create plugin package
mkdir -p plugin-package
cp build/libs/my-plugin.jar plugin-package/plugin.jar
cp src/main/resources/plugin.json plugin-package/
cd plugin-package && zip -r ../my-plugin.micyou-plugin.zip .
```

### 5. Install Plugin

1. Open MicYou application
2. Go to Settings → Plugins
3. Click "Import Plugin" button
4. Select the `.micyou-plugin.zip` file
5. Enable the plugin

## Core Interfaces

### Plugin

Main plugin interface, defining lifecycle methods:

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

Provides plugin runtime environment:

```kotlin
interface PluginContext {
    val pluginId: String
    val pluginDataDir: String

    // Localization interface
    val localization: PluginLocalization
    val appLocalization: PluginLocalization

    // Data storage
    fun getString(key: String, defaultValue: String): String
    fun putString(key: String, value: String)
    fun getBoolean(key: String, defaultValue: Boolean): Boolean
    fun putBoolean(key: String, value: Boolean)
    fun getInt(key: String, defaultValue: Int): Int
    fun putInt(key: String, value: Int)
    fun getFloat(key: String, defaultValue: Float): Float
    fun putFloat(key: String, value: Float)

    // Logging
    fun log(message: String)
    fun logError(message: String, throwable: Throwable? = null)

    // Host capabilities
    val host: PluginHost
}
```

### PluginHost

Provides access to host application capabilities:

```kotlin
interface PluginHost {
    // State flows
    val streamState: StateFlow<StreamState>
    val audioLevels: StateFlow<Float>
    val isMuted: StateFlow<Boolean>
    val connectionInfo: StateFlow<ConnectionInfo?>
    val audioConfig: StateFlow<AudioConfig>

    // Audio configuration
    fun updateAudioConfig(config: AudioConfig)
    fun updateAudioConfig(block: AudioConfig.() -> AudioConfig)

    // Stream control
    suspend fun startStream(ip: String, port: Int, mode: ConnectionMode, isClient: Boolean)
    suspend fun stopStream()
    suspend fun setMute(muted: Boolean)
    fun setMonitoring(enabled: Boolean)

    // Audio effect registration
    fun registerAudioEffect(effect: AudioEffectProvider, priority: Int = 100)
    fun unregisterAudioEffect(effect: AudioEffectProvider)

    // UI feedback
    fun showSnackbar(message: String)
    fun showNotification(title: String, message: String)

    // Settings access
    fun getSetting(key: String, defaultValue: String): String
    fun setSetting(key: String, value: String)
    // ... other settings methods

    // Platform info
    val platform: PlatformInfo
}
```

### PluginUIProvider

Provides plugin UI components:

```kotlin
interface PluginUIProvider {
    val hasMainWindow: Boolean get() = false
    val hasDialog: Boolean get() = false

    // Window configuration (desktop)
    val windowWidth: Dp get() = 600.dp
    val windowHeight: Dp get() = 500.dp
    val windowTitle: String get() = "Plugin Window"
    val windowResizable: Boolean get() = true

    // Mobile UI mode
    val mobileUIMode: MobileUIMode get() = MobileUIMode.Dialog

    @Composable
    fun MainWindow(onClose: () -> Unit) {}

    @Composable
    fun DialogContent(onDismiss: () -> Unit) {}
}

enum class MobileUIMode {
    Dialog,     // Dialog mode
    NewScreen   // New screen mode
}
```

### PluginSettingsProvider

Provides plugin settings page:

```kotlin
interface PluginSettingsProvider {
    @Composable
    fun SettingsContent()
}
```

## Advanced Features

### Access Host State

```kotlin
class MyPlugin : Plugin {
    private var context: PluginContext? = null

    override fun onLoad(context: PluginContext) {
        this.context = context

        // Get current stream state
        val state = context.host.streamState.value
        context.log("Current stream state: $state")

        // Get audio configuration
        val config = context.host.audioConfig.value
        context.log("NS enabled: ${config.enableNS}")
    }
}
```

### Modify Audio Configuration

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

### Register Custom Audio Effect

```kotlin
class MyNoiseReducer : AudioEffectProvider {
    override val id = "com.example.myplugin.noise-reducer"
    override val name = "My Noise Reducer"
    override val description = "Custom noise reduction effect"
    override var isEnabled = true

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // Implement noise reduction algorithm
        return input
    }

    override fun reset() {
        // Reset internal state
    }

    override fun release() {
        // Release resources
    }
}

class MyPlugin : Plugin, AudioEffectPlugin {
    override val audioEffectProvider = MyNoiseReducer()
    override val effectPriority = 50  // Higher priority

    override fun onLoad(context: PluginContext) {
        // Register audio effect
        context.host.registerAudioEffect(audioEffectProvider, effectPriority)
    }

    override fun onUnload() {
        context?.host?.unregisterAudioEffect(audioEffectProvider)
    }
}
```

### Show Notifications

```kotlin
class MyPlugin : Plugin {
    fun notifyUser() {
        context?.host?.showSnackbar("Operation completed!")
        context?.host?.showNotification("My Plugin", "Background task finished")
    }
}
```

### Read/Modify Application Settings

```kotlin
class MyPlugin : Plugin {
    fun readAppSettings() {
        val host = context?.host ?: return

        // Read application settings
        val theme = host.getSetting("theme", "system")
        val autoStart = host.getSettingBoolean("autoStart", false)

        // Modify application settings
        host.setSettingBoolean("autoStart", true)
    }
}
```

## Localization

Plugins support multi-language localization. Create an `i18n/` folder in resources:

```
src/main/resources/
└── i18n/
    ├── en.json
    ├── zh-CN.json
    └── ja.json
```

JSON file format:

```json
{
  "plugin.name": "My Plugin",
  "plugin.description": "A sample plugin",
  "settings.title": "Settings",
  "button.save": "Save"
}
```

Use localization in code:

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

## Complete Example

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
        // Settings page content
    }
}
```

## Related Documentation

- [Plugin API Reference](./plugin-api-reference)
- [Plugin Development Best Practices](./plugin-best-practices)
- [Plugin Package Format Specification](./plugin-package-format)