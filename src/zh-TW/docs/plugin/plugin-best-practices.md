---
title: MicYou 插件開發最佳實踐
description: MicYou 插件開發最佳實踐指南，包含專案結構、生命週期管理、音訊效果開發和效能優化建議
keywords: MicYou插件,插件最佳實踐,Kotlin插件開發,音訊插件優化,JVM插件架構
---

# MicYou 插件開發最佳實踐

本文檔提供 MicYou 插件開發的最佳實踐和建議。

## 專案結構

### 推薦目錄結構

```
my-plugin/
├── build.gradle.kts
├── src/
│   └── main/
│       ├── kotlin/
│       │   └── com/example/myplugin/
│       │       ├── MyPlugin.kt           # 主類別
│       │       ├── MyPluginUI.kt         # UI 元件
│       │       ├── MyPluginSettings.kt   # 設定頁面
│       │       ├── AudioEffects.kt       # 音訊效果（可選）
│       │       └── model/                # 資料模型
│       │           └ Config.kt
│       └── resources/
│           └── plugin.json               # 清單檔案
└ README.md
```

### 程式碼組織

將不同功能分離到不同檔案：

```kotlin
// MyPlugin.kt - 主類別
class MyPlugin : Plugin {
    override val manifest = PluginManifest(...)
    // 生命週期方法
}

// MyPluginUI.kt - UI 元件
class MyPluginUI : PluginUIProvider {
    // UI 實作
}

// MyPluginSettings.kt - 設定頁面
class MyPluginSettings : PluginSettingsProvider {
    // 設定頁面實作
}
```

## 生命週期管理

### 正確管理狀態

```kotlin
class MyPlugin : Plugin {
    private var context: PluginContext? = null
    private var isRunning = false

    override fun onLoad(context: PluginContext) {
        this.context = context
        context.log("Plugin loaded")
    }

    override fun onEnable() {
        if (isRunning) return
        isRunning = true
        startBackgroundTask()
    }

    override fun onDisable() {
        if (!isRunning) return
        isRunning = false
        stopBackgroundTask()
    }

    override fun onUnload() {
        context = null
        releaseAllResources()
    }
}
```

### 避免記憶體洩漏

```kotlin
class MyPlugin : Plugin {
    private val jobs = mutableListOf<Job>()

    override fun onEnable() {
        jobs.add(startTask1())
        jobs.add(startTask2())
    }

    override fun onDisable() {
        jobs.forEach { it.cancel() }
        jobs.clear()
    }
}
```

## 存取主機能力

### 監聽狀態變化

```kotlin
@Composable
override fun MainWindow(onClose: () -> Unit) {
    val host = context?.host ?: return

    // 監聽串流狀態
    val streamState by host.streamState.collectAsState()

    // 監聽音訊電平
    val audioLevel by host.audioLevels.collectAsState()

    // 監聯音訊配置
    val audioConfig by host.audioConfig.collectAsState()

    Column {
        Text("Stream: $streamState")
        Text("Level: $audioLevel")
        Text("NS: ${audioConfig.enableNS}")
    }
}
```

### 修改音訊配置

```kotlin
class MyPlugin : Plugin {
    fun enableNoiseReduction() {
        context?.host?.updateAudioConfig { config ->
            config.copy(
                enableNS = true,
                nsType = NoiseReductionType.RNNoise
            )
        }
    }

    fun setAmplification(gainDb: Float) {
        context?.host?.updateAudioConfig { config ->
            config.copy(amplification = gainDb)
        }
    }
}
```

## 音訊效果開發

### 實作自訂降噪

```kotlin
class CustomNoiseReducer : AudioEffectProvider {
    override val id = "com.example.custom-ns"
    override val name = "Custom Noise Reducer"
    override val description = "AI-powered noise reduction"
    override var isEnabled = true

    private var model: NoiseModel? = null

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        if (!isEnabled) return input

        // 實作降噪演算法
        val output = ShortArray(input.size)
        for (i in input.indices) {
            output[i] = reduceNoise(input[i])
        }
        return output
    }

    private fun reduceNoise(sample: Short): Short {
        // 降噪邏輯
        return sample
    }

    override fun reset() {
        model?.reset()
    }

    override fun release() {
        model?.close()
        model = null
    }

    override fun onConfigChanged(config: AudioConfig) {
        // 根據配置調整參數
    }
}
```

### 註冊音訊效果

```kotlin
class MyPlugin : Plugin {
    private val noiseReducer = CustomNoiseReducer()

    override fun onLoad(context: PluginContext) {
        // 註冊效果器，優先級 50（數值越小越先執行）
        context.host.registerAudioEffect(noiseReducer, priority = 50)
    }

    override fun onUnload() {
        // 註銷效果器
        context?.host?.unregisterAudioEffect(noiseReducer)
        noiseReducer.release()
    }
}
```

### 使用 AudioEffectPlugin 簡化

```kotlin
class MyPlugin : AudioEffectPlugin {
    override val manifest = PluginManifest(...)

    override val audioEffectProvider = CustomNoiseReducer()
    override val effectPriority = 50

    // 生命週期由 AudioEffectPlugin 自動處理
}
```

## 資料儲存

### 使用 PluginContext 儲存

```kotlin
class MyPlugin : Plugin {
    private var context: PluginContext? = null

    fun saveConfig(config: Config) {
        context?.apply {
            putString("serverUrl", config.serverUrl)
            putInt("port", config.port)
            putBoolean("ssl", config.useSsl)
        }
    }

    fun loadConfig(): Config {
        return context?.let {
            Config(
                serverUrl = it.getString("serverUrl", "localhost"),
                port = it.getInt("port", 8080),
                useSsl = it.getBoolean("ssl", false)
            )
        } ?: Config()
    }
}
```

### 檔案儲存

```kotlin
class MyPlugin : Plugin {
    private fun saveDataFile(data: String) {
        val context = context ?: return
        val file = File(context.pluginDataDir, "data.json")
        file.writeText(data)
    }

    private fun loadDataFile(): String? {
        val context = context ?: return null
        val file = File(context.pluginDataDir, "data.json")
        return if (file.exists()) file.readText() else null
    }
}
```

## UI 開發

### 回應式 UI

```kotlin
class MyPluginUI : PluginUIProvider {
    override val hasMainWindow = true

    @Composable
    override fun MainWindow(onClose: () -> Unit) {
        var data by remember { mutableStateOf(emptyList<Item>()) }
        var loading by remember { mutableStateOf(true) }

        LaunchedEffect(Unit) {
            data = loadData()
            loading = false
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn {
                items(data) { item ->
                    ItemRow(item)
                }
            }
        }
    }
}
```

### 行動端 UI 模式選擇

```kotlin
class MyPlugin : Plugin, PluginUIProvider {
    // 對於複雜 UI，使用新頁面模式
    override val mobileUIMode = MobileUIMode.NewScreen

    // 對於簡單對話框，使用對話框模式
    // override val mobileUIMode = MobileUIMode.Dialog
}
```

### 設定頁面最佳實踐

```kotlin
class MyPluginSettings : PluginSettingsProvider {
    @Composable
    override fun SettingsContent() {
        var serverUrl by remember { mutableStateOf("") }
        var port by remember { mutableStateOf(8080) }

        Column(Modifier.padding(16.dp).fillMaxWidth()) {
            Text("Connection Settings", style = MaterialTheme.typography.titleMedium)

            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = serverUrl,
                onValueChange = { serverUrl = it },
                label = { Text("Server URL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = port.toString(),
                onValueChange = { port = it.toIntOrNull() ?: 8080 },
                label = { Text("Port") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(Modifier.height(16.dp))

            Button(
                onClick = { saveSettings(serverUrl, port) },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Save")
            }
        }
    }
}
```

## 通知和反饋

### 顯示訊息

```kotlin
class MyPlugin : Plugin {
    fun showFeedback() {
        val host = context?.host ?: return

        // 簡短訊息
        host.showSnackbar("Operation completed!")

        // 系統通知
        host.showNotification(
            title = "My Plugin",
            message = "Background task finished successfully"
        )
    }
}
```

## 錯誤處理

### 優雅處理錯誤

```kotlin
class MyPlugin : Plugin {
    fun performOperation() {
        try {
            val result = riskyOperation()
            context?.log("Operation succeeded: $result")
        } catch (e: Exception) {
            context?.logError("Operation failed", e)
            context?.host?.showSnackbar("Operation failed: ${e.message}")
        }
    }
}
```

### 驗證主機狀態

```kotlin
class MyPlugin : Plugin {
    fun startStreaming() {
        val host = context?.host ?: run {
            context?.logError("Host not available")
            return
        }

        if (host.streamState.value != StreamState.Idle) {
            host.showSnackbar("Please stop current stream first")
            return
        }

        // 啟動串流
    }
}
```

## 效能優化

### 音訊處理優化

```kotlin
class OptimizedEffect : AudioEffectProvider {
    private var buffer: ShortArray = ShortArray(0)

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // 重用緩衝區避免分配
        if (buffer.size != input.size) {
            buffer = ShortArray(input.size)
        }

        // 使用 SIMD 或其他優化技術
        for (i in input.indices) {
            buffer[i] = processSample(input[i])
        }

        return buffer
    }
}
```

### 協程使用

```kotlin
class MyPlugin : Plugin {
    private val scope = CoroutineScope(Dispatchers.Default)

    override fun onEnable() {
        scope.launch {
            while (isActive) {
                performBackgroundTask()
                delay(1000)
            }
        }
    }

    override fun onDisable() {
        scope.cancel()
    }
}
```

## 相關文檔

- [插件開發指南](./plugin-development-guide)
- [插件 API 參考](./plugin-api-reference)
- [插件包格式規範](./plugin-package-format)