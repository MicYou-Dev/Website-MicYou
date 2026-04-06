---
title: MicYou Plugin API Reference
description: Complete MicYou Plugin API documentation with detailed descriptions of all interfaces, classes, methods, and data types
keywords: MicYou API,plugin interface,PluginContext,PluginHost,audio effect API,Kotlin plugin API
---

# MicYou Plugin API Reference

This document describes all interfaces, classes, and methods of the MicYou Plugin API in detail.

## Table of Contents

- [Plugin](#plugin)
- [PluginManifest](#pluginmanifest)
- [PluginContext](#plugincontext)
- [PluginHost](#pluginhost)
- [PluginDataChannel](#plugindatachannel)
- [PluginInfo](#plugininfo)
- [PluginPlatform](#pluginplatform)
- [PluginUIProvider](#pluginuiprovider)
- [PluginSettingsProvider](#pluginsettingsprovider)
- [AudioEffectProvider](#audioeffectprovider)
- [AudioEffectPlugin](#audioeffectplugin)
- [PluginLocalization](#pluginlocalization)
- [PluginLocalizationProvider](#pluginlocalizationprovider)
- [Data Types](#data-types)

## Plugin

Main plugin interface that all plugins must implement.

```kotlin
interface Plugin {
    val manifest: PluginManifest
    fun onLoad(context: PluginContext) {}
    fun onEnable() {}
    fun onDisable() {}
    fun onUnload() {}
}
```

### Properties

| Property | Type | Description |
|------|------|------|
| `manifest` | `PluginManifest` | Plugin metadata manifest containing basic plugin information |

### Methods

#### onLoad

```kotlin
fun onLoad(context: PluginContext)
```

Called when the plugin is loaded. This is the best time for plugin initialization.

**Parameters:**
- `context` - Plugin context providing runtime environment access

**Timing:** Called immediately after the plugin package is parsed and validated, after the plugin instance is created.

**Example:**
```kotlin
override fun onLoad(context: PluginContext) {
    this.context = context
    context.log("Plugin ${manifest.name} loaded")

    // Access host capabilities
    val host = context.host
    context.log("Platform: ${host.platform.name}")
}
```

#### onEnable

```kotlin
fun onEnable()
```

Called when the plugin is enabled.

**Timing:** Called when the user enables the plugin in settings.

#### onDisable

```kotlin
fun onDisable()
```

Called when the plugin is disabled.

**Timing:** Called when the user disables the plugin in settings.

#### onUnload

```kotlin
fun onUnload()
```

Called when the plugin is unloaded.

**Timing:** Called when the plugin is deleted or the application closes.

---

## PluginManifest

Plugin metadata manifest describing basic plugin information.

```kotlin
@Serializable
data class PluginManifest(
    val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String = "",
    val tags: List<String> = emptyList(),
    val platform: PluginPlatform = PluginPlatform.BOTH,
    val minApiVersion: String,
    val mainClass: String
)
```

### Properties

| Property | Type | Required | Default | Description |
|------|------|------|--------|------|
| `id` | `String` | Yes | - | Plugin unique identifier in reverse domain format |
| `name` | `String` | Yes | - | Plugin display name |
| `version` | `String` | Yes | - | Version number following semantic versioning |
| `author` | `String` | Yes | - | Author name |
| `description` | `String` | No | `""` | Plugin description |
| `tags` | `List<String>` | No | `emptyList()` | Tags list |
| `platform` | `PluginPlatform` | No | `BOTH` | Supported platform |
| `minApiVersion` | `String` | Yes | - | Minimum API version requirement |
| `mainClass` | `String` | Yes | - | Main class fully qualified name |

---

## PluginContext

Plugin runtime context providing plugin runtime environment access.

```kotlin
interface PluginContext {
    val pluginId: String
    val pluginDataDir: String
    val localization: PluginLocalization
    val appLocalization: PluginLocalization
    val host: PluginHost

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
}
```

### Properties

| Property | Type | Description |
|------|------|------|
| `pluginId` | `String` | Plugin unique identifier |
| `pluginDataDir` | `String` | Plugin-specific data directory path |
| `localization` | `PluginLocalization` | Plugin localization interface |
| `appLocalization` | `PluginLocalization` | Application global localization interface |
| `host` | `PluginHost` | Host application access interface |

---

## PluginHost

Provides access to host application capabilities, allowing plugins to interact with the host.

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

    // Data channels
    fun createDataChannel(id: String, config: DataChannelConfig = DataChannelConfig()): PluginDataChannel
    fun getDataChannel(id: String): PluginDataChannel?
    fun closeDataChannel(id: String)

    // UI feedback
    fun showSnackbar(message: String)
    fun showNotification(title: String, message: String)

    // Settings access
    fun getSetting(key: String, defaultValue: String): String
    fun setSetting(key: String, value: String)
    fun getSettingBoolean(key: String, defaultValue: Boolean): Boolean
    fun setSettingBoolean(key: String, value: Boolean)
    fun getSettingInt(key: String, defaultValue: Int): Int
    fun setSettingInt(key: String, value: Int)
    fun getSettingFloat(key: String, defaultValue: Float): Float
    fun setSettingFloat(key: String, value: Float)

    // Platform info
    val platform: PlatformInfo
}
```

### State Flows

| Property | Type | Description |
|------|------|------|
| `streamState` | `StateFlow<StreamState>` | Current stream state |
| `audioLevels` | `StateFlow<Float>` | Audio levels |
| `isMuted` | `StateFlow<Boolean>` | Mute state |
| `connectionInfo` | `StateFlow<ConnectionInfo?>` | Connection info |
| `audioConfig` | `StateFlow<AudioConfig>` | Audio configuration |

### Methods

#### updateAudioConfig

```kotlin
fun updateAudioConfig(config: AudioConfig)
fun updateAudioConfig(block: AudioConfig.() -> AudioConfig)
```

Update audio processing configuration.

**Example:**
```kotlin
context.host.updateAudioConfig {
    copy(enableNS = true, nsType = NoiseReductionType.RNNoise)
}
```

#### startStream / stopStream

```kotlin
suspend fun startStream(ip: String, port: Int, mode: ConnectionMode, isClient: Boolean)
suspend fun stopStream()
```

Start/stop audio stream.

#### registerAudioEffect / unregisterAudioEffect

```kotlin
fun registerAudioEffect(effect: AudioEffectProvider, priority: Int = 100)
fun unregisterAudioEffect(effect: AudioEffectProvider)
```

Register/unregister custom audio effect provider. Lower priority values execute first.

#### createDataChannel / getDataChannel / closeDataChannel

```kotlin
fun createDataChannel(id: String, config: DataChannelConfig = DataChannelConfig()): PluginDataChannel
fun getDataChannel(id: String): PluginDataChannel?
fun closeDataChannel(id: String)
```

Create/get/close custom network data channel.

**Parameters:**
- `id` - Channel unique identifier
- `config` - Channel configuration

**Example:**
```kotlin
val channel = context.host.createDataChannel("my-channel")
channel.connect("192.168.1.100", 8080)
// ... use channel
context.host.closeDataChannel("my-channel")
```

#### showSnackbar / showNotification

```kotlin
fun showSnackbar(message: String)
fun showNotification(title: String, message: String)
```

Display UI feedback.

---

## PluginDataChannel

Custom network data channel interface allowing plugins to establish independent network connections.

```kotlin
enum class DataChannelMode {
    Tcp, Udp
}

data class DataChannelConfig(
    val mode: DataChannelMode = DataChannelMode.Tcp,
    val port: Int = 0,
    val bufferSize: Int = 8192
)

interface PluginDataChannel {
    val id: String
    val config: DataChannelConfig
    val isConnected: Flow<Boolean>
    val localPort: Int

    suspend fun connect(host: String, port: Int): Result<Unit>
    suspend fun bind(port: Int = 0): Result<Unit>
    suspend fun send(data: ByteArray): Result<Unit>
    fun receive(): Flow<ByteArray>
    suspend fun close()
}
```

### DataChannelMode

| Mode | Description |
|------|------|
| `Tcp` | TCP connection, reliable transmission |
| `Udp` | UDP connection, low latency |

### DataChannelConfig

| Property | Type | Default | Description |
|------|------|--------|------|
| `mode` | `DataChannelMode` | `Tcp` | Connection mode |
| `port` | `Int` | `0` | Local port (0 for auto assignment) |
| `bufferSize` | `Int` | `8192` | Receive buffer size |

### PluginDataChannel Methods

#### connect

```kotlin
suspend fun connect(host: String, port: Int): Result<Unit>
```

Connect to remote host as client.

**Parameters:**
- `host` - Remote host address
- `port` - Remote port

**Returns:** `Result<Unit>` indicating connection result

#### bind

```kotlin
suspend fun bind(port: Int = 0): Result<Unit>
```

Bind to local port, listen for connections as server.

**Parameters:**
- `port` - Local port, 0 for auto assignment

**Returns:** `Result<Unit>` indicating binding result

#### send

```kotlin
suspend fun send(data: ByteArray): Result<Unit>
```

Send data.

#### receive

```kotlin
fun receive(): Flow<ByteArray>
```

Receive data stream.

#### close

```kotlin
suspend fun close()
```

Close channel.

### Usage Example

```kotlin
class CameraStreamPlugin : Plugin {
    private lateinit var channel: PluginDataChannel

    override fun onEnable() {
        channel = context.host.createDataChannel("camera-stream",
            DataChannelConfig(mode = DataChannelMode.Udp)
        )

        scope.launch {
            channel.connect("192.168.1.100", 9000)
                .onSuccess {
                    while (true) {
                        val frame = captureCameraFrame()
                        channel.send(frame)
                        delay(33) // ~30fps
                    }
                }
                .onFailure { e ->
                    context.logError("Connection failed: ${e.message}")
                }
        }
    }

    override fun onDisable() {
        context.host.closeDataChannel("camera-stream")
    }
}
```

---

## PluginInfo

Plugin runtime information.

```kotlin
data class PluginInfo(
    val manifest: PluginManifest,
    val isEnabled: Boolean = false,
    val isLoaded: Boolean = false,
    val installPath: String,
    val iconPath: String? = null
)
```

---

## PluginPlatform

Plugin supported platform enumeration.

```kotlin
enum class PluginPlatform {
    MOBILE,    // Mobile only
    DESKTOP,   // Desktop only
    BOTH       // Both need to be installed
}
```

---

## PluginUIProvider

Plugin UI provider interface.

```kotlin
enum class MobileUIMode {
    Dialog,    // Dialog mode
    NewScreen  // New screen mode
}

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
```

### Properties

| Property | Type | Default | Description |
|------|------|--------|------|
| `hasMainWindow` | `Boolean` | `false` | Whether to provide main window |
| `hasDialog` | `Boolean` | `false` | Whether to provide dialog |
| `windowWidth` | `Dp` | `600.dp` | Window width (desktop) |
| `windowHeight` | `Dp` | `500.dp` | Window height (desktop) |
| `windowTitle` | `String` | `"Plugin Window"` | Window title |
| `windowResizable` | `Boolean` | `true` | Whether window is resizable |
| `mobileUIMode` | `MobileUIMode` | `Dialog` | Mobile UI mode |

---

## PluginSettingsProvider

Plugin settings page provider interface.

```kotlin
interface PluginSettingsProvider {
    @Composable
    fun SettingsContent()
}
```

---

## AudioEffectProvider

Audio effect provider interface for implementing custom audio processing.

```kotlin
interface AudioEffectProvider {
    val id: String
    val name: String
    val description: String
    var isEnabled: Boolean

    fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray
    fun reset()
    fun release()
    fun onConfigChanged(config: AudioConfig) {}
}
```

### Properties

| Property | Type | Description |
|------|------|------|
| `id` | `String` | Effect unique identifier |
| `name` | `String` | Effect display name |
| `description` | `String` | Effect description |
| `isEnabled` | `Boolean` | Whether enabled |

### Methods

#### process

```kotlin
fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray
```

Process audio data.

**Parameters:**
- `input` - Input audio sample data (16-bit PCM)
- `channelCount` - Number of channels
- `sampleRate` - Sample rate

**Returns:** Processed audio data

---

## AudioEffectPlugin

Audio effect plugin interface simplifying audio effect plugin implementation.

```kotlin
interface AudioEffectPlugin : Plugin {
    val audioEffectProvider: AudioEffectProvider
    val effectPriority: Int get() = 100
}
```

---

## Data Types

### StreamState

```kotlin
enum class StreamState {
    Idle, Connecting, Streaming, Error
}
```

### ConnectionMode

```kotlin
enum class ConnectionMode {
    Wifi, Bluetooth, Usb
}
```

### NoiseReductionType

```kotlin
enum class NoiseReductionType {
    Ulunas, RNNoise, Speexdsp, None
}
```

### AudioConfig

```kotlin
data class AudioConfig(
    val enableNS: Boolean = false,
    val nsType: NoiseReductionType = NoiseReductionType.RNNoise,
    val enableAGC: Boolean = false,
    val agcTargetLevel: Int = 32000,
    val enableVAD: Boolean = false,
    val vadThreshold: Int = 10,
    val enableDereverb: Boolean = false,
    val dereverbLevel: Float = 0.5f,
    val amplification: Float = 0.0f
)
```

### ConnectionInfo

```kotlin
data class ConnectionInfo(
    val mode: ConnectionMode,
    val ipAddress: String,
    val port: Int,
    val isClient: Boolean
)
```

### PlatformInfo

```kotlin
data class PlatformInfo(
    val name: String,
    val version: String,
    val isDesktop: Boolean,
    val isMobile: Boolean
)
```