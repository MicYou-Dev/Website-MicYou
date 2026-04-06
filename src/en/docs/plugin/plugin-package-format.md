---
title: MicYou Plugin Package Format Specification
description: Detailed MicYou plugin package structure specification including plugin.json configuration, JAR file requirements, and icon specifications
keywords: MicYou plugin format,plugin.json configuration,plugin package structure,JVM plugin packaging,plugin development specification
---

# MicYou Plugin Package Format Specification

## Plugin Package Structure

A plugin package is a ZIP compressed file with the extension `.micyou-plugin.zip`, containing the following structure:

```
my-plugin.micyou-plugin.zip
├── plugin.json        # Required: Plugin metadata manifest
├── plugin.jar         # Required: Plugin code (Kotlin/JVM compiled artifact)
├── assets/            # Optional: Resource files directory
│   ├── images/
│   ├── sounds/
│   └── ...
└── icon.png           # Optional: Plugin icon (recommended 128x128 PNG)
```

## plugin.json Specification

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
      "description": "Plugin unique identifier in reverse domain format, e.g. com.example.myplugin"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Plugin display name"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$",
      "description": "Version number following semantic versioning, e.g. 1.0.0 or 1.0.0-beta"
    },
    "author": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Author name"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Plugin description"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["camera", "streaming", "audio", "video", "utility", "effect", "network", "storage"]
      },
      "description": "Plugin tags for categorization and filtering"
    },
    "platform": {
      "type": "string",
      "enum": ["mobile", "desktop", "both"],
      "default": "both",
      "description": "Supported platform: mobile=mobile only, desktop=desktop only, both=both platforms required"
    },
    "minApiVersion": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Minimum API version requirement"
    },
    "mainClass": {
      "type": "string",
      "description": "Plugin main class fully qualified name, must implement Plugin interface"
    }
  }
}
```

### Field Descriptions

| Field | Required | Type | Description |
|------|------|------|------|
| id | Yes | string | Plugin unique identifier in reverse domain format |
| name | Yes | string | Plugin display name, 1-100 characters |
| version | Yes | string | Semantic version number |
| author | Yes | string | Author name |
| description | Yes | string | Plugin description, 1-500 characters |
| tags | No | string[] | Tags array for categorization and filtering |
| platform | No | string | Supported platform: mobile/desktop/both, default both |
| minApiVersion | Yes | string | Minimum API version |
| mainClass | Yes | string | Main class fully qualified name |

## Complete Example

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

## plugin.jar Requirements

- Must be a valid JVM JAR file
- Main class must implement `com.lanrhyme.micyou.plugin.Plugin` interface
- Can contain other dependency classes, but using shaded JAR is recommended to avoid conflicts
- File size should not exceed 50MB

## Icon Specification

- Format: PNG
- Recommended size: 128x128 pixels
- Supports transparent background
- Filename must be `icon.png`

## Platform Description

| Value | Description |
|------|------|
| `mobile` | Android only support |
| `desktop` | JVM Desktop only support |
| `both` | Both platforms need to be installed, used for cross-platform features |

## Related Documentation

- [Plugin Development Guide](./plugin-development-guide)
- [Plugin API Reference](./plugin-api-reference)
- [Plugin Development Best Practices](./plugin-best-practices)