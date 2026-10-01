---
title: Plugin Marketplace Policy - MicYou
description: "Developer policies for the MicYou Plugin Marketplace: licensing terms, GPLv3 plugin exception, security requirements, and submission workflow."
keywords: MicYou,plugin marketplace,marketplace policy,GPL exception,security requirements,submission workflow
---

# Plugin Marketplace Policy

This document defines the admission standards, licensing policies, and security review workflow for publishing plugins to the official MicYou Plugin Marketplace.

## 1. Licensing Policy & Plugin Exception

MicYou is licensed under GNU GPLv3 with an official plugin exception (**MicYou Plugin Exception v1.0**).

### 1.1 Scope of Exemption
- Plugins developed against the official MicYou Plugin API and Host API **are exempt from the GPLv3 copyleft/viral terms**.
- Independent, non-commercial plugins may freely adopt permissive open-source licenses (such as MIT, Apache-2.0, BSD) or proprietary closed-source licenses.

### 1.2 Commercial Plugin Guidelines
- Distributing commercial plugins for monetary payment, paid subscriptions, or enterprise licenses requires prior written permission from the MicYou copyright holders.
- Internal tools developed by enterprises strictly for in-house usage without public distribution do not require commercial licensing.

## 2. Marketplace Admission Criteria

Plugins submitted to the official MicYou Plugin Marketplace must satisfy one of the following criteria:

1. **Open Source Admission**: Complete source code is publicly accessible under a recognized open-source license (e.g. MIT, Apache-2.0, GPL-3.0).
2. **Review-Based Admission**: Closed-source or commercial offerings must undergo formal security audits and compliance verification by the review team.

### Localization Best Practices

Marketplace listings adapt dynamically to user UI language settings:
- Provide `nameI18n` and `descriptionI18n` mappings (keyed by BCP-47 language tags) in `plugin.json`.
- Submissions should ideally include at least English (`en`) and Simplified Chinese (`zh-CN`) descriptions.

## 3. Security & Privacy Rules

- **Principle of Least Privilege**: Plugins must only request capabilities strictly required for their core functionality.
- **Audio Privacy & Telemetry**: Never record, upload, or exfiltrate live microphone audio or clipboard data without explicit user consent.
- **Filesystem Isolation**: File access must remain contained within the plugin's private directory without attempting path traversal.
- **Zero Malicious Behavior**: Any form of cryptocurrency mining, Trojan backdoors, code injection, or host tampering is strictly prohibited.

## 4. Submission & Review Workflow

1. Develop, test, and package your plugin via GitHub Actions / CI, publishing the final archive to your GitHub Releases.
2. Fork the official marketplace repository ([MicYou-Plugins](https://github.com/MicYou-Dev/MicYou-Plugins)) and add `plugin.json` under `plugin/<plugin-id>/`.
3. Open a Pull Request. Automated CI validates the manifest structure, syntax, and permission declarations.
4. The review team performs code security and licensing checks. Once approved, the PR is merged and automatically published to the live marketplace index.
