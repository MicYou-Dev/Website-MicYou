---
title: Install on iOS - MicYou
description: Guide to sideloading and installing MicYou on iOS devices using Sideloadly or LiveContainer + SideStore.
keywords: MicYou iOS,iOS sideload,Sideloadly,SideStore,LiveContainer,install IPA,iPhone microphone
---

# Install on iOS

[MicYou for iOS](https://github.com/MicYou-Dev/MicYou-iOS) requires **iOS 18.0 or later**. Since it is not listed on the App Store, you can sideload it using **Sideloadly**, **LiveContainer + SideStore**, **AltStore**, or other IPA signing tools.

Free Apple ID signing limitations:
- App signatures expire after **7 days** and must be refreshed.
- A free Apple ID can install at most **3 sideloaded apps** simultaneously.

## Prerequisites

- **Hardware**: A macOS or Windows computer, an iPhone or iPad (iOS 18+), and a USB data cable.
- **Account**: An [Apple ID](https://support.apple.com/apple-account) registered with an email address (phone-number-only accounts are not supported).
- **Windows Requirement**: Install the non-Microsoft Store version of [iTunes](https://www.apple.com/itunes/) (uninstall the Microsoft Store version first if installed).
- **IPA Package**: Download from the [Download page](/en/download) or [GitHub Releases](https://github.com/MicYou-Dev/MicYou-iOS/releases/latest):
  - `MicYou-<version>.ipa`: Full build (with Live Activity, Dynamic Island, and Control Center widget) for direct installation via **Sideloadly**, **SideStore**, or **AltStore**.
  - `MicYou-<version>-LiveContainer.ipa`: Build without widget extensions, dedicated for **LiveContainer**.

## Method 1: Install with Sideloadly

1. Download and install [Sideloadly](https://sideloadly.io/#download).
2. Open Sideloadly and enter your Apple ID email in the `Apple ID` field.
3. Connect your iOS device via USB, tap **Trust** on the device, and enter your passcode.
4. Click the `IPA` icon on the left, select `MicYou-<version>.ipa`, and click `Start` (keep the refresh icon next to `Start` enabled for automatic Wi-Fi renewal).
5. Enter your Apple ID password and 2FA code when prompted. Installation is complete when `Done.` appears.

## Method 2: Install with LiveContainer + SideStore

Once configured, this method lets you refresh apps directly on your device with a local VPN, and apps inside LiveContainer do not count toward the 3-app limit.

### 1. Enable Developer Mode (iOS 16+)

Go to iOS `Settings` -> `Privacy & Security` -> `Developer Mode` -> turn it **On**, then restart your device and confirm.

### 2. Install & Trust LiveContainer + SideStore

1. Download and launch [iloader](https://github.com/nab138/iloader/releases/latest) on your computer.
2. Connect your iOS device via USB and trust the computer.
3. Sign in with your Apple ID in iloader and click **LiveContainer + SideStore (Stable)** to install.
4. On iOS, go to `Settings` -> `General` -> `VPN & Device Management`, tap your Apple ID under `Developer App`, and tap **Trust**.

### 3. Configure Certificate & Install MicYou

1. Install [LocalDevVPN](https://apps.apple.com/app/localdevvpn/id6755608044) from the App Store and keep it connected.
2. Open **LiveContainer** and tap the **SideStore** icon in the top-left corner (reopen if it closes on first launch).
3. In SideStore's **My Apps** tab, tap `Refresh All` and sign in with your Apple ID.
4. Return to **LiveContainer** -> **Settings** and tap `Import Certificate from SideStore`.
5. Install MicYou (choose one):
   - **Inside LiveContainer (No slot limit)**: Tap **"+"** in LiveContainer and select `MicYou-<version>-LiveContainer.ipa`.
   - **Standalone via SideStore (Supports Live Activity & Dynamic Island)**: Tap **"+"** in SideStore's **My Apps** tab and select `MicYou-<version>.ipa`.

## Troubleshooting

- **"Untrusted Developer" prompt**: Go to `Settings` -> `General` -> `VPN & Device Management`, tap your Apple ID, and select **Trust**.
- **Live Activity or Dynamic Island unavailable**: The LiveContainer build omits widget extensions. To use Live Activity, Dynamic Island, and the Control Center button, install the standard `MicYou-<version>.ipa` directly via Sideloadly or SideStore.
