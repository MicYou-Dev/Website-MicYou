---
title: Android Legacy Device Compatibility Build - MicYou
description: Compile a custom compatibility build of the MicYou Android client for Android 5.0+ (API 21+) and 32-bit legacy devices to repurpose old phones as PC microphones.
keywords: MicYou Android,Android compatibility build,API 21,Android 5.0,legacy devices,MultiDex,Gradle build
---

# Android Legacy Device Compatibility Build

MicYou's Android client defaults to modern Android 7.0+ (API 24+). If you have an older Android 5.0+ (API 21+) or 32-bit smartphone lying in a drawer, you can compile a dedicated compatibility build to turn it into a dedicated PC microphone.

## Prerequisites

- **JDK**: JDK 17 or later, with `JAVA_HOME` configured
- **Android SDK**: Android SDK Platform 36 and Build-Tools 36.0.0+, with `ANDROID_HOME` configured

## Build Commands

### 1. Standard Build (Default)

Targets Android 7.0+ (API 24+):

```bash
./gradlew :composeApp:assembleDebug
```

### 2. Compatibility Build (Android 5.0+ / API 21+)

Pass `-Pmicyou.androidCompat=api21` to activate the compatibility build pipeline:

```bash
# Linux / macOS / Bash / Zsh
./gradlew :composeApp:assembleDebug -Pmicyou.androidCompat=api21

# Windows PowerShell (quote parameters containing dots)
./gradlew :composeApp:assembleDebug "-Pmicyou.androidCompat=api21"
```

The resulting APK will be saved at:
```text
composeApp/build/outputs/apk/debug/composeApp-debug.apk
```

## Compatibility Architecture & Fallback Mechanisms

When `-Pmicyou.androidCompat=api21` is enabled, Gradle and the runtime automatically engage fallback strategies:

### 1. Source Set Bridging

To handle library API differences on legacy Android versions (such as Haze blur and MaterialKolor color extraction), the codebase uses isolated Source Sets:

```text
composeApp/src/
├── main/          # Core business logic, imported via bridge package (com.lanrhyme.micyou.ui.compose.haze)
├── normal/        # Standard mode: delegates to modern libraries (Haze 1.7+ / MaterialKolor 5.x)
└── compat/        # Compat mode: falls back to legacy implementations (translucent background / MaterialKolor 1.7.x)
```

Gradle mounts the appropriate Source Set during build, keeping the core codebase free of bloated conditional branches.

### 2. Dynamic Runtime Guards

Key Android subsystems include runtime API checks and safe fallbacks:

| Module | Compatibility Area | Modern Behavior (API 24+) | Compatibility Fallback (API 21-23) |
| --- | --- | --- | --- |
| `AudioEngine.kt` | Sample format & reading | `PCM_FLOAT`, `read(float[], ..., READ_NON_BLOCKING)` | Falls back to `PCM_16BIT`, 3-parameter blocking read |
| `AudioService.kt` | Foreground Service | `startForegroundService()` with type parameter | Falls back to `startService()` + legacy `startForeground()` |
| `AudioService.kt` | Notifications & WakeLocks | Notification channels, `FLAG_IMMUTABLE` | Skips channels, uses `FLAG_UPDATE_CURRENT` |
| `MicYouTileService` | Quick Settings Tile | 2-parameter `startActivityAndCollapse` | 1-parameter compatibility overload |
| `Application` | 64K Method Limit | Native ART MultiDex | Reflectively invokes `MultiDex.install()` |
| `ColorScheme` | Dynamic Wallpaper Color | Material 3 dynamic color extraction (API 31+) | Falls back to static tonal palette approximation |

## Known Limitations

- **Target API**: Compatibility mode sets `targetSdk` to 29. It is designed for sideloading and personal use, not for Google Play submission.
- **Hardware Performance**: Android 5.x/6.x hardware has limited CPU and RAM. Compose UI may experience occasional frame drops on very low-end devices, but background audio streaming remains smooth.
- **ProGuard / R8**: Code obfuscation is disabled in release compatibility builds to ensure stability across legacy Dalvik and ART runtimes.

## Troubleshooting & Debugging

If the app crashes or misbehaves on an older device, inspect logs via ADB:

```bash
# View MicYou crash and audio engine logs
adb logcat -s MicYouApplication AudioEngine
```
