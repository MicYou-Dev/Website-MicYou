---
title: MicYou 插件 API 參考
description: MicYou Plugin API 完整介面文檔，包含所有類別、方法和資料類型的詳細說明
keywords: MicYou API,插件介面,PluginContext,PluginHost,音訊效果API,Kotlin插件API
---

# MicYou 插件 API 參考

本文檔詳細描述 MicYou Plugin API 的所有介面、類別和方法。

## 目錄

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
- [資料類型](#資料類型)

## Plugin

插件主介面，所有插件必須實作此介面。

```kotlin
interface Plugin {
    val manifest: PluginManifest
    fun onLoad(context: PluginContext) {}
    fun onEnable() {}
    fun onDisable() {}
    fun onUnload() {}
}
```

### 屬性

| 属性 | 类型 | 说明 |
|------|------|------|
| `manifest` | `PluginManifest` | 插件元資料清單，包含插件的基本資訊 |

### 方法

#### onLoad

```kotlin
fun onLoad(context: PluginContext)
```

插件載入時呼叫。這是插件初始化的最佳時機。

**參數：**
- `context` - 插件上下文，提供執行環境存取能力

**呼叫時機：** 插件包被解析並驗證通過後，在插件實例建立後立即呼叫。

**範例：**
```kotlin
override fun onLoad(context: PluginContext) {
    this.context = context
    context.log("Plugin ${manifest.name} loaded")

    // 存取主機能力
    val host = context.host
    context.log("Platform: ${host.platform.name}")
}
```

#### onEnable

```kotlin
fun onEnable()
```

插件啟用時呼叫。

**呼叫時機：** 使用者在設定中啟用插件時呼叫。

#### onDisable

```kotlin
fun onDisable()
```

插件停用時呼叫。

**呼叫時機：** 使用者在設定中停用插件時呼叫。

#### onUnload

```kotlin
fun onUnload()
```

插件卸載時呼叫。

**呼叫時機：** 插件被刪除或應用關閉時呼叫。

---

## PluginManifest

插件元資料清單，描述插件的基本資訊。

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

### 属性

| 属性 | 类型 | 必需 | 預設值 | 说明 |
|------|------|------|--------|------|
| `id` | `String` | 是 | - | 插件唯一識別符，反向域名格式 |
| `name` | `String` | 是 | - | 插件顯示名稱 |
| `version` | `String` | 是 | - | 版本號，遵循語義化版本規範 |
| `author` | `String` | 是 | - | 作者名稱 |
| `description` | `String` | 否 | `""` | 插件描述 |
| `tags` | `List<String>` | 否 | `emptyList()` | 標籤列表 |
| `platform` | `PluginPlatform` | 否 | `BOTH` | 支援的平台 |
| `minApiVersion` | `String` | 是 | - | 最低 API 版本要求 |
| `mainClass` | `String` | 是 | - | 主類別全限定名 |

---

## PluginContext

插件執行上下文，提供插件執行環境存取能力。

```kotlin
interface PluginContext {
    val pluginId: String
    val pluginDataDir: String
    val localization: PluginLocalization
    val appLocalization: PluginLocalization
    val host: PluginHost

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
}
```

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `pluginId` | `String` | 插件唯一識別符 |
| `pluginDataDir` | `String` | 插件專屬資料目錄路徑 |
| `localization` | `PluginLocalization` | 插件本地化介面 |
| `appLocalization` | `PluginLocalization` | 應用全域本地化介面 |
| `host` | `PluginHost` | 主機應用存取介面 |

---

## PluginHost

提供對主機應用的存取能力，允許插件與主機互動。

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

    // 資料通道
    fun createDataChannel(id: String, config: DataChannelConfig = DataChannelConfig()): PluginDataChannel
    fun getDataChannel(id: String): PluginDataChannel?
    fun closeDataChannel(id: String)

    // UI 反饋
    fun showSnackbar(message: String)
    fun showNotification(title: String, message: String)

    // 設定存取
    fun getSetting(key: String, defaultValue: String): String
    fun setSetting(key: String, value: String)
    fun getSettingBoolean(key: String, defaultValue: Boolean): Boolean
    fun setSettingBoolean(key: String, value: Boolean)
    fun getSettingInt(key: String, defaultValue: Int): Int
    fun setSettingInt(key: String, value: Int)
    fun getSettingFloat(key: String, defaultValue: Float): Float
    fun setSettingFloat(key: String, value: Float)

    // 平台資訊
    val platform: PlatformInfo
}
```

### 狀態流

| 属性 | 类型 | 说明 |
|------|------|------|
| `streamState` | `StateFlow<StreamState>` | 目前串流狀態 |
| `audioLevels` | `StateFlow<Float>` | 音訊電平 |
| `isMuted` | `StateFlow<Boolean>` | 靜音狀態 |
| `connectionInfo` | `StateFlow<ConnectionInfo?>` | 連線資訊 |
| `audioConfig` | `StateFlow<AudioConfig>` | 音訊配置 |

### 方法

#### updateAudioConfig

```kotlin
fun updateAudioConfig(config: AudioConfig)
fun updateAudioConfig(block: AudioConfig.() -> AudioConfig)
```

更新音訊處理配置。

**範例：**
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

啟動/停止音訊串流。

#### registerAudioEffect / unregisterAudioEffect

```kotlin
fun registerAudioEffect(effect: AudioEffectProvider, priority: Int = 100)
fun unregisterAudioEffect(effect: AudioEffectProvider)
```

註冊/註銷自訂音訊效果器。優先級數值越小，越先執行。

#### createDataChannel / getDataChannel / closeDataChannel

```kotlin
fun createDataChannel(id: String, config: DataChannelConfig = DataChannelConfig()): PluginDataChannel
fun getDataChannel(id: String): PluginDataChannel?
fun closeDataChannel(id: String)
```

建立/取得/關閉自訂網路資料通道。

**參數：**
- `id` - 通道唯一識別符
- `config` - 通道配置

**範例：**
```kotlin
val channel = context.host.createDataChannel("my-channel")
channel.connect("192.168.1.100", 8080)
// ... 使用通道
context.host.closeDataChannel("my-channel")
```

#### showSnackbar / showNotification

```kotlin
fun showSnackbar(message: String)
fun showNotification(title: String, message: String)
```

顯示 UI 反饋。

---

## PluginDataChannel

自訂網路資料通道介面，允許插件建立獨立的網路連線。

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

| 模式 | 说明 |
|------|------|
| `Tcp` | TCP 連線，可靠傳輸 |
| `Udp` | UDP 連線，低延遲 |

### DataChannelConfig

| 属性 | 类型 | 預設值 | 说明 |
|------|------|--------|------|
| `mode` | `DataChannelMode` | `Tcp` | 連線模式 |
| `port` | `Int` | `0` | 本地埠（0 表示自動分配） |
| `bufferSize` | `Int` | `8192` | 接收緩衝區大小 |

### PluginDataChannel 方法

#### connect

```kotlin
suspend fun connect(host: String, port: Int): Result<Unit>
```

作為客戶端連線到遠端主機。

**參數：**
- `host` - 遠端主機地址
- `port` - 遠端埠

**返回：** `Result<Unit>` 表示連線結果

#### bind

```kotlin
suspend fun bind(port: Int = 0): Result<Unit>
```

綁定本地埠，作為伺服端監聽連線。

**參數：**
- `port` - 本地埠，0 表示自動分配

**返回：** `Result<Unit>` 表示綁定結果

#### send

```kotlin
suspend fun send(data: ByteArray): Result<Unit>
```

傳送資料。

#### receive

```kotlin
fun receive(): Flow<ByteArray>
```

接收資料流。

#### close

```kotlin
suspend fun close()
```

關閉通道。

### 使用範例

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

插件執行時資訊。

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

插件支援平台枚舉。

```kotlin
enum class PluginPlatform {
    MOBILE,    // 仅移动端
    DESKTOP,   // 仅桌面端
    BOTH       // 两端都需要安装
}
```

---

## PluginUIProvider

插件 UI 提供者介面。

```kotlin
enum class MobileUIMode {
    Dialog,    // 对话框模式
    NewScreen  // 新页面模式
}

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
```

### 属性

| 属性 | 类型 | 預設值 | 说明 |
|------|------|--------|------|
| `hasMainWindow` | `Boolean` | `false` | 是否提供主視窗 |
| `hasDialog` | `Boolean` | `false` | 是否提供對話框 |
| `windowWidth` | `Dp` | `600.dp` | 視窗寬度（桌面端） |
| `windowHeight` | `Dp` | `500.dp` | 視窗高度（桌面端） |
| `windowTitle` | `String` | `"Plugin Window"` | 視窗標題 |
| `windowResizable` | `Boolean` | `true` | 視窗是否可調整大小 |
| `mobileUIMode` | `MobileUIMode` | `Dialog` | 行動端 UI 模式 |

---

## PluginSettingsProvider

插件設定頁面提供者介面。

```kotlin
interface PluginSettingsProvider {
    @Composable
    fun SettingsContent()
}
```

---

## AudioEffectProvider

音訊效果提供者介面，用於實作自訂音訊處理。

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

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `String` | 效果器唯一識別符 |
| `name` | `String` | 效果器顯示名稱 |
| `description` | `String` | 效果器描述 |
| `isEnabled` | `Boolean` | 是否啟用 |

### 方法

#### process

```kotlin
fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray
```

處理音訊資料。

**參數：**
- `input` - 輸入音訊採樣資料（16-bit PCM）
- `channelCount` - 声道数
- `sampleRate` - 采样率

**返回：** 处理后的音频数据

---

## AudioEffectPlugin

音訊效果插件介面，簡化音訊效果插件的實作。

```kotlin
interface AudioEffectPlugin : Plugin {
    val audioEffectProvider: AudioEffectProvider
    val effectPriority: Int get() = 100
}
```

---

## 資料類型

### StreamState

```kotlin
enum class StreamState {
    Idle, Connecting, Streaming, Error
}
```

### ConnectionMode

```kotlin
enum class ConnectionMode {
    Wifi, Usb
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