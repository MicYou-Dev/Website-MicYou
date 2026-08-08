---
title: MicYou 插件包格式规范
description: 插件目录结构、zip 打包、市场仓库与更新机制
keywords: MicYou,插件包,zip,市场,更新
---

# MicYou 插件包格式规范

## 目录结构

一个插件是一个目录，至少包含：

```text
<plugin-id>/
├── plugin.json      # manifest（必填）
├── <entry>          # 入口产物：native 为 .so/.dylib/.dll，wasm 为 .wasm
└── panel.html       # 可选：设置侧边栏/独立窗口页面（ui.panels.entry）
```

插件目录名与 manifest 中的 `id` 一致，安装在 `~/.config/micyou/plugins/<id>/`
（Windows 为 `%APPDATA%\micyou\plugins\<id>\`）

## plugin.json 字段

必填：`id`（反向域名）、`name`、`version`（semver）、`runtime`（wasm|native）、`entry`

常用可选字段：

| 字段 | 说明 |
| --- | --- |
| `author` / `license` | 作者与许可 |
| `homepage` / `repository` | 项目地址与源码仓库（市场收录要求） |
| `capabilities` | 声明请求的能力（dsp.node/config.read/config.write/audio.play/fs.read/fs.write/network.io/open.url/clipboard.read/clipboard.write/event.emit/message.send/audio.state/device.list） |
| `kind` | dsp \| utility \| ui \| bridge |
| `dsp` | DSP 节点描述（insertAfter/first/frameSize/realtimeSafe） |
| `ui` | 面板描述（route/label/panels[{id,label,entry,sidebar}]） |
| `config` | 默认配置 JSON |
| `configSchema` | 声明式配置 schema，宿主自动生成设置表单 |
| `dependencies` | 前置插件依赖 [{id,version,optional}] |
| `updateUrl` | 远端 manifest URL（更新检查与一键更新） |
| `arches` | native 插件支持的 CPU 架构 |
| `nameI18n` / `descriptionI18n` | 本地化名称与描述（BCP-47） |

## zip 打包

应用「导入插件」接受 `.zip`，要求：

- 内含 `plugin.json`（可在子目录，安装时自动剥离前缀）
- 安装前宿主展示权限预览（能力/作者/许可），确认后才解压
- 解压路径防穿越（zip slip 防护）

打包命令：

```bash
micyou plugin package <插件目录> -o plugin.zip
```

## 市场仓库

官方市场：https://github.com/MicYou-Dev/MicYou-Plugins

```text
/
├── index.json                 # 插件清单（自动生成）
└── plugin/<plugin-id>/
    ├── plugin.json            # manifest（updateUrl 指向本仓库）
    └── plugin.zip             # 打包产物
```

应用内更新机制：插件 `updateUrl` 指向市场仓库的 `plugin.json`，点「检查更新」
做 semver 对比，有新版下载同目录 `plugin.zip` 覆盖安装
