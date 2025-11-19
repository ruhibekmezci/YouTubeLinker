# YouTube Timestamp Linker

A powerful Chrome extension designed to help you quickly share specific moments from YouTube videos.

Whether you need a clickable link, a QR code for mobile, or a clean screenshot of a specific frame, this tool handles it all—via a simple popup or keyboard shortcuts.

## ✨ Key Features

* **Smart Link Copy:** Copies a timestamped link that works everywhere.
    * **Rich Text:** Pastes as a clickable hyperlink in Word, Notion, Google Docs.
    * **Plain Text:** Pastes as a formatted text + URL in WhatsApp, Discord, Notepad.
* **📸 Instant Screenshot:** Captures a clean screenshot (without the player controls) of the exact video frame and copies it to your clipboard.
* **📱 QR Code Generator:** Generates a QR code for the timestamped link to share easily with mobile devices.
* **⌨️ Keyboard Shortcuts:** Control everything without touching your mouse.
* **Universal Support:** Works on Standard Videos, Shorts, Mobile (`m.youtube.com`) links.

## 🚀 How to Use

### Method 1: The Popup Menu
Click the extension icon in your toolbar to open the menu:
* **Link Kopyala:** Copies the smart link.
* **QR Kod:** Generates and copies a QR code image.
* **Resim Çek:** Captures and copies the video frame.

### Method 2: Keyboard Hotkeys (Power User Mode)
You don't even need to open the extension! Just use these shortcuts while watching a video:

| Shortcut | Action | Result |
| :--- | :--- | :--- |
| **`Alt + C`** | **Copy Link** | Copies formatted text & link to clipboard. |
| **`Alt + S`** | **Screenshot** | Copies a clean PNG image of the frame to clipboard. |
| **`Alt + Q`** | **QR Code** | Copies a QR code image of the link to clipboard. |

*A toast notification will appear in the bottom-right corner to confirm the action.*

## 🔧 Installation (Developer Mode)

Since this extension is not on the Chrome Web Store, you need to load it manually.

1.  **Download the Project:** Clone or download this repository to a folder.
2.  **Download the Library:**
    * Download `qrcode.min.js` from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js).
    * Save it directly inside your project folder (next to `manifest.json`).
3.  **Load in Chrome:**
    * Go to `chrome://extensions`.
    * Enable **"Developer mode"** (top-right).
    * Click **"Load unpacked"** (top-left).
    * Select your project folder.

## 💻 Technology Used

* HTML5 / CSS3 / JavaScript (ES6+)
* Chrome Extension Manifest V3
* **qrcode.min.js:** Local library for QR generation.
* **Canvas API:** For capturing high-quality video frames.
* **Clipboard API:** For writing text, HTML, and PNG images to the clipboard.
