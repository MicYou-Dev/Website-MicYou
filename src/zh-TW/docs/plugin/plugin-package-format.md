---
title: MicYou 插件包格式規範
description: 插件目錄結構、zip 打包、市場倉庫與更新機制
keywords: MicYou,插件包,zip,市場,更新
---

# MicYou 插件包格式規範

## 目錄結構

一個插件是一個目錄，至少包含：

```text
<plugin-id>/
├── plugin.json      # manifest（必填）
├── <entry>          # 入口產物：native 為 .so/.dylib/.dll，wasm 為 .wasm
└── panel.html       # 可選：設置側邊欄/獨立窗口頁面（ui.panels.entry）
```

插件目錄名與 manifest 中的 `id` 一致，安裝在 `~/.config/micyou/plugins/<id>/`
（Windows 為 `%APPDATA%\micyou\plugins\<id>\`）

## plugin.json 字段

必填：`id`（反向域名）、`name`、`version`（semver）、`runtime`（wasm|native）、`entry`

常用可選字段：

| 字段 | 說明 |
| --- | --- |
| `author` / `license` | 作者與許可 |
| `homepage` / `repository` | 項目地址與源碼倉庫（市場收錄要求） |
| `capabilities` | 聲明請求的能力（dsp.node/config.read/config.write/audio.play/fs.read/fs.write/network.io/open.url/clipboard.read/clipboard.write/event.emit/message.send/audio.state/device.list） |
| `kind` | dsp \| utility \| ui \| bridge |
| `dsp` | DSP 節點描述（insertAfter/first/frameSize/realtimeSafe） |
| `ui` | 面板描述（route/label/panels[{id,label,entry,sidebar}]） |
| `config` | 默認配置 JSON |
| `configSchema` | 聲明式配置 schema，宿主自動生成設置表單 |
| `dependencies` | 前置插件依賴 [{id,version,optional}] |
| `updateUrl` | 遠端 manifest URL（更新檢查與一鍵更新） |
| `arches` | native 插件支持的 CPU 架構 |
| `nameI18n` / `descriptionI18n` | 本地化名稱與描述（BCP-47） |

## zip 打包

應用「導入插件」接受 `.zip`，要求：

- 內含 `plugin.json`（可在子目錄，安裝時自動剝離前綴）
- 安裝前宿主展示權限預覽（能力/作者/許可），確認後才解壓
- 解壓路徑防穿越（zip slip 防護）

打包命令：

```bash
micyou plugin package <插件目錄> -o plugin.zip
```

## 市場倉庫

官方市場：https://github.com/MicYou-Dev/MicYou-Plugins

```text
/
├── index.json                 # 插件清單（自動生成）
└── plugin/<plugin-id>/
    ├── plugin.json            # manifest（updateUrl 指向本倉庫）
    └── plugin.zip             # 打包產物
```

應用內更新機制：插件 `updateUrl` 指向市場倉庫的 `plugin.json`，點「檢查更新」
做 semver 對比，有新版下載同目錄 `plugin.zip` 覆蓋安裝
