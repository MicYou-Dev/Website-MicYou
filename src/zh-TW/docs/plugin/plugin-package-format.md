---
title: 插件套件格式規範 - MicYou
description: MicYou 插件目錄結構、plugin.json 清單定義、ZIP 打包分發與市集索引規範。
keywords: MicYou,插件套件,ZIP打包,插件市集,自動更新,套件格式
---

# 插件套件格式規範

本文件定義了 MicYou 插件的實體檔案結構、清單格式、打包規範及市集分發標準。

## 1. 目錄結構

每個插件都是一個獨立的目錄，至少包含清單檔案 `plugin.json` 與進入點執行產物：

```text
<plugin-id>/
├── plugin.json      # 插件清單描述檔案（必需）
├── <entry>          # 進入點產物：Native 插件為 .so/.dylib/.dll，WASM 插件為 .wasm
└── panel.html       # 專屬設定面板 HTML 頁面（選填）
```

本地安裝時，插件目錄存放在系統標準應用程式資料路徑下：
- **Windows**：`%APPDATA%\micyou\plugins\<plugin-id>\`
- **macOS / Linux**：`~/.config/micyou/plugins/<plugin-id>/`

## 2. 清單欄位（plugin.json）

`plugin.json` 採用標準 JSON 格式。以下為常用欄位說明：

| 欄位 | 類型 | 必填 | 說明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 反向域名識別碼，如 `dev.micyou.noisegate` |
| `name` | string | 是 | 插件展示名稱 |
| `version` | string | 是 | 遵循 SemVer 規範的版本號（如 `1.2.0`） |
| `runtime` | string | 是 | 執行環境，取值為 `wasm` 或 `native` |
| `entry` | string | 是 | 進入點檔案名稱（相對於插件目錄的相對路徑） |
| `author` | string | 否 | 作者姓名或組織名稱 |
| `license` | string | 否 | SPDX 授權條款標識（如 `MIT`、`Apache-2.0`） |
| `homepage` | string | 否 | 專案首頁連結 |
| `repository` | string | 否 | 原始碼儲存庫連結 |
| `capabilities` | string[] | 否 | 申請的能力權限清單 |
| `kind` | string | 否 | 分類：`dsp`、`utility`、`ui`、`bridge` |
| `dsp` | object | 否 | DSP 節點資訊（`insertAfter`、`first`、`realtimeSafe`） |
| `ui` | object | 否 | 面板資訊（`route`、`label`、`panels`） |
| `config` | object | 否 | 預設設定 JSON 物件 |
| `configSchema` | object | 否 | 宣告式表單結構，宿主自動渲染設定項 |
| `dependencies` | object[] | 否 | 依賴的前置插件 `[{ id, version, optional }]` |
| `updateUrl` | string | 否 | 遠端清單 URL，用於應用程式內檢查更新 |
| `arches` | string[] | 否 | Native 插件支援的 CPU 架構（如 `x86_64`、`aarch64`） |

## 3. ZIP 打包與匯入規範

MicYou 支援直接匯入 `.zip` 格式的插件安裝套件。打包時需遵循以下規則：

- **根目錄包含清單**：ZIP 檔解壓縮後根目錄下必須包含 `plugin.json`（或僅包含一層以插件 ID 命名的根資料夾）。
- **目錄跨越防護**：宿主解壓縮時會校驗相對路徑，攔截任何包含 `../` 的非法穿越路徑（Zip Slip 防護）。
- **權限安全預覽**：客戶端在解壓縮安裝前會先讀取 `plugin.json` 並向使用者呈現權限申請清單，經授權後才落盤安裝。

### 打包命令

使用 MicYou CLI 工具一鍵打包：

```bash
micyou plugin package <插件目錄路徑> -o plugin.zip
```

CLI 會自動過濾 `target/`、`.git/` 以及暫存編譯快取檔案。

## 4. 官方市集儲存庫結構

MicYou 官方插件市集透過公開 Git 儲存庫維護索引與分發：

```text
/
├── index.json                 # 市集插件總索引（CI 自動產生）
└── plugin/<plugin-id>/
    ├── plugin.json            # 插件最新清單檔案
    └── plugin.zip             # 打包構建產物
```

### 自動更新機制

1. 插件在 `plugin.json` 中設定 `updateUrl`，指向市集中該插件的 `plugin.json`。
2. 使用者在客戶端點擊「檢查更新」時，宿主抓取遠端清單並與本地進行 SemVer 版本比對。
3. 發現新版本後，客戶端自動下載同目錄下的 `plugin.zip` 完成覆蓋安裝並平滑重新載入。
