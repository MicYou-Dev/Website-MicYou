---
title: Android Legacy Compatibility Build Guide - MicYou
description: Build guide and fallback architecture for compiling MicYou Android client targeting Android 5.0+ (API 21+) and 32-bit legacy devices.
keywords: MicYou Android,Android compatibility build,API 21,Android 5.0,legacy devices,MultiDex,Gradle build
---

# Android Legacy Compatibility Build Guide

MicYou's Android client defaults to Android 7.0+ (API 24+). For Android 5.0+ (API 21+) and 32-bit legacy devices, an on-demand compatibility build mode is provided.

## Prerequisites

- **JDK**: JDK 17 or later, with the `JAVA_HOME` environment variable configured
- **Android SDK**: Android SDK Platform 36 and Build-Tools 36.0.0+, with the `ANDROID_HOME` environment variable configured

## Build Commands

### Standard Build (Default)

Targets Android 7.0+ (API 24+):

```bash
./gradlew :composeApp:assembleDebug
```

### Compatibility Build (API 21+ / Android 5.0+)

Enable the compatibility mode with the `-Pmicyou.androidCompat=api21` property:

```bash
# Bash / Zsh / Linux / macOS
./gradlew :composeApp:assembleDebug -Pmicyou.androidCompat=api21

# PowerShell (quote parameters containing dots)
./gradlew :composeApp:assembleDebug "-Pmicyou.androidCompat=api21"
```

Generated APK output path:
```text
composeApp/build/outputs/apk/debug/composeApp-debug.apk
```

## Compatibility Architecture & Fallback Mechanisms

When `-Pmicyou.androidCompat=api21` is specified, the build configuration and runtime dynamically route to the compatibility pipeline:

### 1. Source Set Bridging Strategy

To resolve API discrepancies in third-party libraries across modern and legacy platforms (such as Haze dynamic blur and MaterialKolor), the project employs a source set bridge:

```text
composeApp/src/
├── main/          # Shared business logic, importing from bridge package (com.lanrhyme.micyou.ui.compose.haze)
├── normal/        # Default mode: delegates to modern libraries (Haze 1.7+ / MaterialKolor 5.x)
└── compat/        # Compat mode: falls back to legacy implementations (translucent background / MaterialKolor 1.7.x)
```

Gradle dynamically selects `normal` or `compat` as the active source set based on `-Pmicyou.androidCompat`, keeping `main/` clean and free from conditional branches.

### 2. Runtime API Dynamic Guards

Core audio and service components include `Build.VERSION.SDK_INT` runtime guards:

| Module | Feature | Modern Behavior (API 24+) | Compatibility Fallback (API 21-23) |
| --- | --- | --- | --- |
| `AudioEngine.kt` | Format & Reading | `PCM_FLOAT`, `read(float[], ..., READ_NON_BLOCKING)` | Falls back to `PCM_16BIT`, 3-parameter blocking read |
| `AudioService.kt` | Foreground Service | `startForegroundService()` with type parameter | Falls back to `startService()` + legacy `startForeground()` |
| `AudioService.kt` | Notification & WakeLock | Notification channels, `FLAG_IMMUTABLE`, exact alarms | Skips channels, uses `FLAG_UPDATE_CURRENT` |
| `MicYouTileService` | Quick Settings Tile | 2-parameter `startActivityAndCollapse` | 1-parameter compatibility overload |
| `Application` | 64K Method Limit | Modern ART native MultiDex | Reflectively calls `MultiDex.install()` |
| `ColorScheme` | Dynamic Colors | Material 3 dynamic color roles (API 31+) | Falls back to static tonal palette approximation |

## Known Limitations

- **Target API**: Compatibility mode sets `targetSdk` to 29, intended primarily for sideloading and testing on legacy hardware rather than Google Play distribution.
- **Performance**: Android 5.x/6.x hardware has constrained RAM and CPU capacity. Compose rendering frame rates may fluctuate on low-end devices.
- **Release Proguard/R8**: Obfuscation is disabled by default in release builds under compatibility mode to preserve ART/Dalvik stability, resulting in larger package sizes.

## Troubleshooting & Debugging

If an issue occurs on older hardware, inspect system logs via ADB:

```bash
# Capture application and audio engine logs
adb logcat -s MicYouApplication AudioEngine
```
