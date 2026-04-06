---
title: MicYou 插件包格式规范
description: MicYou 插件包结构规范详解，包含 plugin.json 配置、JAR 文件要求和图标规范
keywords: MicYou插件格式,plugin.json配置,插件包结构,JVM插件打包,插件开发规范
---

# MicYou 插件包格式规范

## 插件包结构

插件包是一个 ZIP 压缩文件，扩展名为 `.micyou-plugin.zip`，包含以下结构：

```
my-plugin.micyou-plugin.zip
├── plugin.json        # 必需：插件元数据清单
├── plugin.jar         # 必需：插件代码（Kotlin/JVM 编译产物）
├── assets/            # 可选：资源文件目录
│   ├── images/
│   ├── sounds/
│   └── ...
└── icon.png           # 可选：插件图标（建议 128x128 PNG）
```

## plugin.json 规范

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "version", "author", "description", "minApiVersion", "mainClass"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$",
      "description": "插件唯一标识符，采用反向域名格式，如 com.example.myplugin"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "插件显示名称"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$",
      "description": "版本号，遵循语义化版本规范，如 1.0.0 或 1.0.0-beta"
    },
    "author": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "作者名称"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "插件描述"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["camera", "streaming", "audio", "video", "utility", "effect", "network", "storage"]
      },
      "description": "插件标签，用于分类和筛选"
    },
    "platform": {
      "type": "string",
      "enum": ["mobile", "desktop", "both"],
      "default": "both",
      "description": "支持的平台：mobile=仅移动端，desktop=仅桌面端，both=两端都需要安装"
    },
    "minApiVersion": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "最低 API 版本要求"
    },
    "mainClass": {
      "type": "string",
      "description": "插件主类全限定名，必须实现 Plugin 接口"
    }
  }
}
```

### 字段说明

| 字段 | 必需 | 类型 | 说明 |
|------|------|------|------|
| id | 是 | string | 插件唯一标识符，反向域名格式 |
| name | 是 | string | 插件显示名称，1-100 字符 |
| version | 是 | string | 语义化版本号 |
| author | 是 | string | 作者名称 |
| description | 是 | string | 插件描述，1-500 字符 |
| tags | 否 | string[] | 标签数组，用于分类筛选 |
| platform | 否 | string | 支持平台：mobile/desktop/both，默认 both |
| minApiVersion | 是 | string | 最低 API 版本 |
| mainClass | 是 | string | 主类全限定名 |

## 完整示例

```json
{
  "id": "com.example.audio-enhancer",
  "name": "Audio Enhancer",
  "version": "1.0.0",
  "author": "Developer Name",
  "description": "A plugin that provides advanced audio enhancement features including custom noise reduction and equalization.",
  "tags": ["audio", "effect"],
  "platform": "both",
  "minApiVersion": "1.0.0",
  "mainClass": "com.example.audioenhancer.AudioEnhancerPlugin"
}
```

## plugin.jar 要求

- 必须是有效的 JVM JAR 文件
- 主类必须实现 `com.lanrhyme.micyou.plugin.Plugin` 接口
- 可以包含其他依赖类，但建议使用 shaded JAR 避免冲突
- 文件大小建议不超过 50MB

## 图标规范

- 格式：PNG
- 建议尺寸：128x128 像素
- 支持透明背景
- 文件名必须为 `icon.png`

## 平台说明

| 值 | 说明 |
|------|------|
| `mobile` | 仅 Android 端支持 |
| `desktop` | 仅 JVM Desktop 端支持 |
| `both` | 两端都需要安装，用于跨平台功能 |

## 相关文档

- [插件开发指南](./plugin-development-guide)
- [插件 API 参考](./plugin-api-reference)
- [插件开发最佳实践](./plugin-best-practices)