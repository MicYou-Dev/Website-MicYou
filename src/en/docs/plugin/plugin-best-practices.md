---
title: MicYou Plugin Development Best Practices
description: Best practices guide for MicYou plugin development including project structure, lifecycle management, audio effect development, and performance optimization
keywords: MicYou plugin,plugin best practices,Kotlin plugin development,audio plugin optimization,JVM plugin architecture
---

# MicYou Plugin Development Best Practices

This document provides best practices and recommendations for MicYou plugin development.

## Project Structure

### Recommended Directory Structure

```
my-plugin/
├── build.gradle.kts
├── src/
│   └── main/
│       ├── kotlin/
│       │   └── com/example/myplugin/
│       │       ├── MyPlugin.kt           # Main class
│       │       ├── MyPluginUI.kt         # UI components
│       │       ├── MyPluginSettings.kt   # Settings page
│       │       ├── AudioEffects.kt       # Audio effects (optional)
│       │       └── model/                # Data models
│       │           └ Config.kt
│       └── resources/
│           └── plugin.json               # Manifest file
└── README.md
```

### Code Organization

Separate different functionalities into different files:

```kotlin
// MyPlugin.kt - Main class
class MyPlugin : Plugin {
    override val manifest = PluginManifest(...)
    // Lifecycle methods
}

// MyPluginUI.kt - UI components
class MyPluginUI : PluginUIProvider {
    // UI implementation
}

// MyPluginSettings.kt - Settings page
class MyPluginSettings : PluginSettingsProvider {
    // Settings page implementation
}
```

## Lifecycle Management

### Properly Manage State

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

### Avoid Memory Leaks

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

## Accessing Host Capabilities

### Listen to State Changes

```kotlin
@Composable
override fun MainWindow(onClose: () -> Unit) {
    val host = context?.host ?: return

    // Listen to stream state
    val streamState by host.streamState.collectAsState()

    // Listen to audio levels
    val audioLevel by host.audioLevels.collectAsState()

    // Listen to audio configuration
    val audioConfig by host.audioConfig.collectAsState()

    Column {
        Text("Stream: $streamState")
        Text("Level: $audioLevel")
        Text("NS: ${audioConfig.enableNS}")
    }
}
```

### Modify Audio Configuration

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

## Audio Effect Development

### Implement Custom Noise Reduction

```kotlin
class CustomNoiseReducer : AudioEffectProvider {
    override val id = "com.example.custom-ns"
    override val name = "Custom Noise Reducer"
    override val description = "AI-powered noise reduction"
    override var isEnabled = true

    private var model: NoiseModel? = null

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        if (!isEnabled) return input

        // Implement noise reduction algorithm
        val output = ShortArray(input.size)
        for (i in input.indices) {
            output[i] = reduceNoise(input[i])
        }
        return output
    }

    private fun reduceNoise(sample: Short): Short {
        // Noise reduction logic
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
        // Adjust parameters based on configuration
    }
}
```

### Register Audio Effect

```kotlin
class MyPlugin : Plugin {
    private val noiseReducer = CustomNoiseReducer()

    override fun onLoad(context: PluginContext) {
        // Register effect with priority 50 (lower values execute first)
        context.host.registerAudioEffect(noiseReducer, priority = 50)
    }

    override fun onUnload() {
        // Unregister effect
        context?.host?.unregisterAudioEffect(noiseReducer)
        noiseReducer.release()
    }
}
```

### Use AudioEffectPlugin for Simplification

```kotlin
class MyPlugin : AudioEffectPlugin {
    override val manifest = PluginManifest(...)

    override val audioEffectProvider = CustomNoiseReducer()
    override val effectPriority = 50

    // Lifecycle is handled automatically by AudioEffectPlugin
}
```

## Data Storage

### Use PluginContext for Storage

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

### File Storage

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

## UI Development

### Responsive UI

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

### Mobile UI Mode Selection

```kotlin
class MyPlugin : Plugin, PluginUIProvider {
    // For complex UI, use new screen mode
    override val mobileUIMode = MobileUIMode.NewScreen

    // For simple dialogs, use dialog mode
    // override val mobileUIMode = MobileUIMode.Dialog
}
```

### Settings Page Best Practices

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

## Notifications and Feedback

### Show Messages

```kotlin
class MyPlugin : Plugin {
    fun showFeedback() {
        val host = context?.host ?: return

        // Short message
        host.showSnackbar("Operation completed!")

        // System notification
        host.showNotification(
            title = "My Plugin",
            message = "Background task finished successfully"
        )
    }
}
```

## Error Handling

### Handle Errors Gracefully

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

### Validate Host State

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

        // Start stream
    }
}
```

## Performance Optimization

### Audio Processing Optimization

```kotlin
class OptimizedEffect : AudioEffectProvider {
    private var buffer: ShortArray = ShortArray(0)

    override fun process(input: ShortArray, channelCount: Int, sampleRate: Int): ShortArray {
        // Reuse buffer to avoid allocation
        if (buffer.size != input.size) {
            buffer = ShortArray(input.size)
        }

        // Use SIMD or other optimization techniques
        for (i in input.indices) {
            buffer[i] = processSample(input[i])
        }

        return buffer
    }
}
```

### Coroutine Usage

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

## Related Documentation

- [Plugin Development Guide](./plugin-development-guide)
- [Plugin API Reference](./plugin-api-reference)
- [Plugin Package Format Specification](./plugin-package-format)