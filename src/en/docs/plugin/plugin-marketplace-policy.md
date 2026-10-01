---
title: MicYou Plugin Marketplace Policy & Guidelines
description: Distribution requirements, licensing terms, GPL plugin exception, and security review process for the MicYou Plugin Marketplace.
keywords: MicYou,plugin marketplace,policy,GPL exception,security guidelines,submission process
---

# Plugin Marketplace Policy & Guidelines

This document outlines the admission requirements, licensing policies, and security review processes for publishing plugins to the official MicYou Plugin Marketplace.

## 1 Licensing Policy & Exceptions

MicYou is licensed under GNU GPLv3 with the MicYou Plugin Exception v1.0.

### 1.1 Scope of Exemption
- Plugin developers can write independent plugins using the official MicYou Plugin API and Host API without GPLv3 copyleft contamination.
- Non-commercial independent plugins can be released under any open source license (e.g. MIT, Apache-2.0) or proprietary closed-source licenses.

### 1.2 Commercial Plugin Policy
- Commercial redistribution, paid sales, or subscription models based on MicYou plugins require prior written authorization or a commercial license from the MicYou copyright holders.
- Internal proprietary tools developed for private use without public commercial distribution are exempt from commercial licensing.

## 2 Official Marketplace Admission Criteria

Plugins submitted to the official marketplace must satisfy one of the following criteria:

1. **Open Source Admission**: Complete source code is publicly accessible under a GPL-compatible or standard OSI license (e.g. GPL-3.0, MIT, Apache-2.0).
2. **Review-Based Admission**: Proprietary or commercial plugins must pass official security and compliance audits to obtain verified distribution certification.

### 2.1 Localization Requirements

The marketplace displays plugin details based on the client's current language:
- When `nameI18n` and `descriptionI18n` (BCP-47 tags) are defined, the marketplace renders matching localized text, falling back to top-level `name` and `description`.
- New submissions should include at least `en` and `zh` (or `zh-CN`) descriptions.

## 3 Security & Compliance Standards

- **Principle of Least Privilege**: Manifests must declare only the capabilities strictly required.
- **Privacy & Telemetry**: Plugins making network requests or collecting telemetry must clearly disclose behavior in documentation. Secretly exfiltrating audio or user data is strictly prohibited.
- **Storage Isolation**: File I/O must remain within the assigned plugin data directory.
- **Prohibited Behavior**: Malicious payloads, backdoors, miners, and sandbox escapes will result in permanent removal and ban.

## 4 Submission Workflow

1. Develop and build artifacts via CI in your repository and publish to GitHub Releases.
2. Submit a Pull Request to the official marketplace repository ([MicYou-Plugins](https://github.com/MicYou-Dev/MicYou-Plugins)) registering `plugin.json` metadata and release URLs.
3. Automated CI validates manifest schema, checksums, and declared capabilities.
4. The review team evaluates code safety and license compliance before merging.
