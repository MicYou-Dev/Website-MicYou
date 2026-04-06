---
title: MicYou 插件开发最佳实践
description: MicYou 插件开发最佳实践指南，包含项目结构、生命周期管理、音频效果开发和性能优化建议
keywords: MicYou插件,插件最佳实践,Kotlin插件开发,音频插件优化,JVM插件架构
---

# MicYou 插件开发最佳实践

本文档提供 MicYou 插件开发的最佳实践和建议。

## 项目结构

### 推荐目录结构

```
my-plugin/
├── build.gradle.kts
├── src/
│   └── main/
│       ├── kotlin/
│       │   └── com/example/myplugin/
│       │       ├── MyPlugin.kt           # 主类
│       │       ├── MyPluginUI.kt         # UI 组件
│       │       ├── MyPluginSettings.kt   # 设置页面
│       │       ├── AudioEffects.kt       # 音频效果（可选）
│       │       └── model/                # 数据模型
│       │           └── Config.kt
│       └── resources/
│           └── plugin.json               # 清单文件
└── README.md
```

### 代码组织

将不同功能分离到不同文件：

```kotlin
// MyPlugin.kt - 主类
class MyPlugin : Plugin {
    override val manifest = PluginManifest(...)
    // 生命周期方法
}

// MyPluginUI.kt - UI 组件
class MyPluginUI : PluginUIProvider {
    // UI 实现
}

// MyPluginSettings.kt - 设置页面
class MyPluginSettings : PluginSettingsProvider {
    // 设置页面实现
}
```

## 生命周期管理

### 正确管理状态

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

### 避免内存泄漏

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

## 访问主机能力

### 监听状态变化

```kotlin
@Composable
override fun MainWindow(onClose: () -> Unit) {
    val host = context?.host ?: return

    // 监听流状态
    val streamState by host.streamState.collectAsState()

    // 监听音频电平
    val audioLevel by host.audioLevels.collectAsState()

    // 监听音频配置
    val audioConfig by host.audioConfig.collectAsState()

    Column {
        Text("Stream: $streamState")
        Text("Level: $audioLevel")
        Text("NS: ${audioConfig.enableNS}")
    }
}
```

### 修改音频配置

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

## 音频效果开发

### 实现自定义降噪

```kotlin
class CustomNoiseReducer : AudioEffectProvider {
    override val id = "com.example.custom-ns"
    override val name = "Custom Noise Reducer"
    override val description = "AI-powered noise reduction"
    override var isEnabled = true

    private var model: NoiseModel? = null

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        if (!isEnabled) return input

        // 实现降噪算法
        val output = ShortArray(input.size)
        for (i in input.indices) {
            output[i] = reduceNoise(input[i])
        }
        return output
    }

    private fun reduceNoise(sample: Short): Short {
        // 降噪逻辑
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
        // 根据配置调整参数
    }
}
```

### 注册音频效果

```kotlin
class MyPlugin : Plugin {
    private val noiseReducer = CustomNoiseReducer()

    override fun onLoad(context: PluginContext) {
        // 注册效果器，优先级 50（数值越小越先执行）
        context.host.registerAudioEffect(noiseReducer, priority = 50)
    }

    override fun onUnload() {
        // 注销效果器
        context?.host?.unregisterAudioEffect(noiseReducer)
        noiseReducer.release()
    }
}
```

### 使用 AudioEffectPlugin 简化

```kotlin
class MyPlugin : AudioEffectPlugin {
    override val manifest = PluginManifest(...)

    override val audioEffectProvider = CustomNoiseReducer()
    override val effectPriority = 50

    // 生命周期由 AudioEffectPlugin 自动处理
}
```

## 数据存储

### 使用 PluginContext 存储

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

### 文件存储

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

## UI 开发

### 响应式 UI

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

### 移动端 UI 模式选择

```kotlin
class MyPlugin : Plugin, PluginUIProvider {
    // 对于复杂 UI，使用新页面模式
    override val mobileUIMode = MobileUIMode.NewScreen

    // 对于简单对话框，使用对话框模式
    // override val mobileUIMode = MobileUIMode.Dialog
}
```

### 设置页面最佳实践

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

## 通知和反馈

### 显示消息

```kotlin
class MyPlugin : Plugin {
    fun showFeedback() {
        val host = context?.host ?: return

        // 简短消息
        host.showSnackbar("Operation completed!")

        // 系统通知
        host.showNotification(
            title = "My Plugin",
            message = "Background task finished successfully"
        )
    }
}
```

## 错误处理

### 优雅处理错误

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

### 验证主机状态

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

        // 启动流
    }
}
```

## 性能优化

### 音频处理优化

```kotlin
class OptimizedEffect : AudioEffectProvider {
    private var buffer: ShortArray = ShortArray(0)

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // 重用缓冲区避免分配
        if (buffer.size != input.size) {
            buffer = ShortArray(input.size)
        }

        // 使用 SIMD 或其他优化技术
        for (i in input.indices) {
            buffer[i] = processSample(input[i])
        }

        return buffer
    }
}
```

### 协程使用

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

## 相关文档

- [插件开发指南](./plugin-development-guide)
- [插件 API 参考](./plugin-api-reference)
- [插件包格式规范](./plugin-package-format)