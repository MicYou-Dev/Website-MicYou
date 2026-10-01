---
title: Android 旧设备兼容构建 - MicYou
description: 为 Android 5.0+ (API 21+) 及老旧 32 位设备编译兼容版 MicYou 客户端，让闲置手机变身电脑麦克风。
keywords: MicYou Android,Android兼容构建,API 21,Android 5.0,老旧设备,MultiDex,Gradle构建
---

# Android 旧设备兼容构建

MicYou Android 客户端默认以现代 Android 7.0+ (API 24+) 为基准。如果希望让家中闲置的 Android 5.0+ (API 21+) 或老旧 32 位手机重新发挥余热当电脑麦克风，可以通过兼容构建流水线进行编译。

## 环境准备

- **JDK**: JDK 17 或更高版本，并配置好 `JAVA_HOME` 环境变量
- **Android SDK**: 安装 Android SDK Platform 36 及 Build-Tools 36.0.0+，并配置 `ANDROID_HOME` 环境变量

## 构建命令

### 1. 标准版本（默认）

适用于 Android 7.0+ (API 24+)：

```bash
./gradlew :composeApp:assembleDebug
```

### 2. 兼容版本（Android 5.0+ / API 21+）

传入 `-Pmicyou.androidCompat=api21` 参数即可开启兼容构建模式：

```bash
# Linux / macOS / Bash / Zsh
./gradlew :composeApp:assembleDebug -Pmicyou.androidCompat=api21

# Windows PowerShell (参数含点号，需使用双引号包裹)
./gradlew :composeApp:assembleDebug "-Pmicyou.androidCompat=api21"
```

构建生成的 APK 文件位于：
```text
composeApp/build/outputs/apk/debug/composeApp-debug.apk
```

## 兼容架构与降级机制

当开启 `-Pmicyou.androidCompat=api21` 时，Gradle 构建与运行时会自动无缝切换至兼容策略：

### 1. Source Set 源码集桥接

针对现代 UI 库在低版本系统上的接口断层（如 Haze 毛玻璃模糊与 MaterialKolor 取色库），项目采用 Source Set 隔离策略：

```text
composeApp/src/
├── main/          # 核心业务代码，统一从桥接包导入 (com.lanrhyme.micyou.ui.compose.haze)
├── normal/        # 标准模式：桥接层调用现代库 (Haze 1.7+ / MaterialKolor 5.x)
└── compat/        # 兼容模式：桥接层采用降级方案 (半透明背景回退 / MaterialKolor 1.7.x)
```

Gradle 在构建时按需挂载源码集，使核心业务无需编写大量平台条件分支。

### 2. 运行时 API 动态降级

针对 Android 底层 API 差异，关键模块内置了版本判断与动态回退保护：

| 模块 | 兼容点 | 现代版本行为 (API 24+) | 兼容模式降级行为 (API 21-23) |
| --- | --- | --- | --- |
| `AudioEngine.kt` | 采样格式与读取 | `PCM_FLOAT`，`read(float[], ..., READ_NON_BLOCKING)` | 回退至 `PCM_16BIT`，采用 3 参数阻塞读取 |
| `AudioService.kt` | 前台服务 | `startForegroundService()` 带前台类型 | 回退至 `startService()` + 传统 `startForeground()` |
| `AudioService.kt` | 通知与唤醒 | 专属通知渠道、`FLAG_IMMUTABLE` | 跳过通知渠道，使用 `FLAG_UPDATE_CURRENT` |
| `MicYouTileService` | 状态栏快捷磁贴 | 2 参数版 `startActivityAndCollapse` | 1 参数兼容版本 |
| `Application` | 64K 方法数限制 | 高版本 ART 原生 MultiDex 支持 | 反射调用 `MultiDex.install()` |
| `ColorScheme` | 动态壁纸取色 | Material 3 动态色彩提取 (API 31+) | 回退至静态预设色盘 |

## 注意事项与已知限制

- **Target API**: 兼容模式将 `targetSdk` 设置为 29，适合侧载或自用测试，不能直接用于上架 Google Play。
- **性能开销**: Android 5.x/6.x 设备芯片与内存性能较弱，Compose 界面在极低端设备上可能略有掉帧，但音频后台传输不受影响。
- **混淆策略**: 兼容模式下的 Release 构建默认关闭代码混淆，以保证在老旧 Dalvik / ART 虚拟机上的稳定性。

## 调试排查

安装到旧手机后如果遇到闪退或异常，可通过 ADB 抓取运行日志：

```bash
# 过滤 MicYou 核心崩溃与音频日志
adb logcat -s MicYouApplication AudioEngine
```
