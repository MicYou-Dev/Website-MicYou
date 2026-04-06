---
title: MicYou 插件包格式規範
description: MicYou 插件包結構規範詳解，包含 plugin.json 配置、JAR 檔案要求和圖示規範
keywords: MicYou插件格式,plugin.json配置,插件包結構,JVM插件打包,插件開發規範
---

# MicYou 插件包格式規範

## 插件包結構

插件包是一個 ZIP 壓縮檔案，副檔名為 `.micyou-plugin.zip`，包含以下結構：

```
my-plugin.micyou-plugin.zip
├── plugin.json        # 必需：插件元資料清單
├── plugin.jar         # 必需：插件程式碼（Kotlin/JVM 編譯產物）
├── assets/            # 可選：資源檔案目錄
│   ├── images/
│   ├── sounds/
│   └── ...
└── icon.png           # 可選：插件圖示（建議 128x128 PNG）
```

## plugin.json 規範

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
      "description": "插件唯一識別符，採用反向域名格式，如 com.example.myplugin"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "插件顯示名稱"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$",
      "description": "版本號，遵循語義化版本規範，如 1.0.0 或 1.0.0-beta"
    },
    "author": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "作者名稱"
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
      "description": "插件標籤，用於分類和篩選"
    },
    "platform": {
      "type": "string",
      "enum": ["mobile", "desktop", "both"],
      "default": "both",
      "description": "支援的平台：mobile=僅行動端，desktop=僅桌面端，both=兩端都需要安裝"
    },
    "minApiVersion": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "最低 API 版本要求"
    },
    "mainClass": {
      "type": "string",
      "description": "插件主類別全限定名，必須實作 Plugin 介面"
    }
  }
}
```

### 欄位說明

| 欄位 | 必需 | 類型 | 說明 |
|------|------|------|------|
| id | 是 | string | 插件唯一識別符，反向域名格式 |
| name | 是 | string | 插件顯示名稱，1-100 字元 |
| version | 是 | string | 語義化版本號 |
| author | 是 | string | 作者名稱 |
| description | 是 | string | 插件描述，1-500 字元 |
| tags | 否 | string[] | 標籤陣列，用於分類篩選 |
| platform | 否 | string | 支援平台：mobile/desktop/both，預設 both |
| minApiVersion | 是 | string | 最低 API 版本 |
| mainClass | 是 | string | 主類別全限定名 |

## 完整範例

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

- 必須是有效的 JVM JAR 檔案
- 主類別必須實作 `com.lanrhyme.micyou.plugin.Plugin` 介面
- 可以包含其他依賴類別，但建議使用 shaded JAR 避免衝突
- 檔案大小建議不超過 50MB

## 圖示規範

- 格式：PNG
- 建議尺寸：128x128 像素
- 支援透明背景
- 檔案名稱必須為 `icon.png`

## 平台說明

| 值 | 說明 |
|------|------|
| `mobile` | 僅 Android 端支援 |
| `desktop` | 僅 JVM Desktop 端支援 |
| `both` | 兩端都需要安裝，用於跨平台功能 |

## 相關文檔

- [插件開發指南](./plugin-development-guide)
- [插件 API 參考](./plugin-api-reference)
- [插件開發最佳實踐](./plugin-best-practices)