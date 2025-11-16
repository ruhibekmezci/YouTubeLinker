# YouTube Timestamp Linker

A lightweight Chrome extension designed to help you quickly create and share timestamped links from YouTube videos.

When you're on a YouTube video page (including Shorts), just click the extension icon. It grabs the video's title and the **exact current time** you are watching, then gives you two simple options:

1.  **Copy Link:** Copies the timestamped link in a "smart" format that works perfectly on *both* rich-text apps (like Word/Notion) and plain-text apps (like WhatsApp/Notepad).
2.  **Generate QR Code:** Instantly generates a QR code of the timestamped link and copies the **image** to your clipboard, ready to be pasted anywhere.

This is the perfect tool for taking notes, sharing specific moments on desktop *and* mobile, or building a research library.

## ✨ How It Works: The "Smart Copy"

This extension solves the problem of "paste" not working the same way in all apps.

### 1. Copy Link (Rich Text + Plain Text)

This button copies the link in **two formats at the same time**:

* **For Rich-Text Apps (Word, Notion, Google Docs):**
    When you paste, you get a clean, clickable hyperlink:
    > **"A Guide to Modern JavaScript" minute: 04:32**

* **For Plain-Text Apps (WhatsApp, Notepad, Discord):**
    When you paste, you get the formatted text *plus* the raw link on a new line, which the app automatically makes clickable:
    > `"A Guide to Modern JavaScript" minute: 04:32`
    > `https://www.youtube.com/watch?v=...&t=272s`

### 2. Generate QR Code

This button generates a QR code for the timestamped link and copies the **image** directly to your clipboard. You can then paste (Ctrl+V) this image into a presentation, an email, or a chat to be scanned by a mobile phone.

## 📋 Features

* **Dual-Format Copy:** Copies a rich-text hyperlink (for Word) and a plain-text fallback (for WhatsApp) simultaneously.
* **QR Code Generator:** Instantly creates and copies a QR code image of the link.
* **Current Timestamp:** Grabs the *exact current time* in the video, not the total duration.
* **Universal Compatibility:** Works seamlessly with all YouTube formats:
    * Regular Videos (`/watch`)
    * YouTube Shorts (`/shorts`)
    * Mobile (`m.youtube.com`) and non-WWW (`youtube.com`) links.
* **Simple UI:** A clean two-button interface.

## 🔧 How to Install (Sideloading)

This extension requires manual installation as it is not on the Chrome Web Store. **Crucially, you must also download the `qrcode.min.js` library.**

1.  **Download the Project:** Download or clone this repository to a permanent folder on your computer (e.g., `C:\Projects\YouTubeLinker`).

2.  **Download the QR Library:** The QR code feature depends on a local library file.
    * Go to this URL: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
    * Your browser will show a page full of code.
    * Press `Ctrl+S` (or `Cmd+S`) to "Save As...".
    * Save the file with the name `qrcode.min.js` **directly inside** your project folder (the same folder as `manifest.json`).

3.  **Load the Extension in Chrome:**
    * Open Google Chrome and navigate to `chrome://extensions`.
    * Enable **"Developer mode"** using the toggle switch in the top-right corner.
    * Click the **"Load unpacked"** button that appears on the top-left.
    * Select your main project folder (the one containing `manifest.json` and `qrcode.min.js`).

4.  **Done!** The extension is now installed. You can pin it to your toolbar for easy access.

## 🚀 How to Use

1.  Go to any YouTube video (or Short).
2.  Pause the video at the exact moment you want to share.
3.  Click the extension icon in your Chrome toolbar.
4.  Click **"Linki Kopyala"** to copy the text/link, or **"QR Kod Oluştur"** to copy the QR image.
5.  Paste (Ctrl+V) into your target application!

*(**Note for Developers:** If you make changes to the code and "Reload" the extension in `chrome://extensions`, you must refresh your YouTube tab (F5) once for the content script to connect.)*

## 💻 Technology Used

* HTML5 / CSS3 / JavaScript (ES6+)
* Chrome Extension Manifest V3
* **qrcode.min.js:** Local library for QR code generation.
* **APIs Used:** `tabs`, `clipboardWrite` (for `text/html`, `text/plain`, and `image/png`).
