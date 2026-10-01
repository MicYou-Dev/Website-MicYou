---
title: 插件包格式规范 - MicYou
description: MicYou 插件目录结构、plugin.json 清单定义、ZIP 打包分发与市场索引规范。
keywords: MicYou,插件包,ZIP打包,插件市场,自动更新,包格式
---

# 插件包格式规范

本文档定义了 MicYou 插件的物理文件结构、清单格式、打包规范及市场分发标准。

## 1. 目录结构

每个插件都是一个独立的目录，至少包含清单文件 `plugin.json` 与入口执行产物：

```text
<plugin-id>/
├── plugin.json      # 插件清单描述文件（必需）
├── <entry>          # 入口产物：Native 插件为 .so/.dylib/.dll，WASM 插件为 .wasm
└── panel.html       # 专属设置面板 HTML 页面（可选）
```

本地安装时，插件目录存放在系统标准应用数据路径下：
- **Windows**：`%APPDATA%\micyou\plugins\<plugin-id>\`
- **macOS / Linux**：`~/.config/micyou/plugins/<plugin-id>/`

## 2. 清单字段（plugin.json）

`plugin.json` 采用标准 JSON 格式。以下为常用字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名标识符，如 `dev.micyou.noisegate` |
| `name` | string | 是 | 插件展示名称 |
| `version` | string | 是 | 遵循 SemVer 规范的版本号（如 `1.2.0`） |
| `runtime` | string | 是 | 运行环境，取值为 `wasm` 或 `native` |
| `entry` | string | 是 | 入口文件名（相对于插件目录的相对路径） |
| `author` | string | 否 | 作者姓名或组织名称 |
| `license` | string | 否 | SPDX 许可证标识（如 `MIT`、`Apache-2.0`） |
| `homepage` | string | 否 | 项目主页链接 |
| `repository` | string | 否 | 源代码仓库链接 |
| `capabilities` | string[] | 否 | 申请的能力权限列表 |
| `kind` | string | 否 | 分类：`dsp`、`utility`、`ui`、`bridge` |
| `dsp` | object | 否 | DSP 节点信息（`insertAfter`、`first`、`realtimeSafe`） |
| `ui` | object | 否 | 面板信息（`route`、`label`、`panels`） |
| `config` | object | 否 | 默认配置 JSON 对象 |
| `configSchema` | object | 否 | 声明式表单结构，宿主自动渲染设置项 |
| `dependencies` | object[] | 否 | 依赖的前置插件 `[{ id, version, optional }]` |
| `updateUrl` | string | 否 | 远端清单 URL，用于应用内检查更新 |
| `arches` | string[] | 否 | Native 插件支持的 CPU 架构（如 `x86_64`、`aarch64`） |

## 3. ZIP 打包与导入规范

MicYou 支持直接导入 `.zip` 格式的插件安装包。打包时需遵循以下规则：

- **根目录包含清单**：ZIP 包解压后根目录下必须包含 `plugin.json`（或仅含有一层以插件 ID 命名的根文件夹）。
- **目录遍历防护**：宿主解压时会校验相对路径，拦截任何包含 `../` 的非法穿越路径（Zip Slip 防护）。
- **权限安全预览**：客户端在解压安装前会先读取 `plugin.json` 并向用户呈现权限申请清单，经授权后才落盘安装。

### 打包命令

使用 MicYou CLI 工具一键打包：

```bash
micyou plugin package <插件目录路径> -o plugin.zip
```

CLI 会自动过滤 `target/`、`.git/` 以及临时编译缓存文件。

## 4. 官方市场仓库结构

MicYou 官方插件市场通过公开 Git 仓库维护索引与分发：

```text
/
├── index.json                 # 市场插件总索引（CI 自动生成）
└── plugin/<plugin-id>/
    ├── plugin.json            # 插件最新清单文件
    └── plugin.zip             # 打包构建产物
```

### 自动更新机制

1. 插件在 `plugin.json` 中配置 `updateUrl`，指向市场中该插件的 `plugin.json`。
2. 用户在客户端点击「检查更新」时，宿主抓取远端清单并与本地进行 SemVer 版本对比。
3. 发现新版本后，客户端自动下载同目录下的 `plugin.zip` 完成覆盖安装并平滑重载。
