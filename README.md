# YouTube Timestamp Linker & Personal Assistant 🚀

A powerful, all-in-one Chrome extension that transforms how you interact with YouTube videos. 

It's not just a link copier; it's a **productivity tool**. Copy timestamped links, generate QR codes, capture clean screenshots, and **pin personal notes** directly onto the video progress bar.

## ✨ Key Features

### 1. 📝 Personal Video Notes (New!)
Turn YouTube into your study notebook.
* **Pin Notes:** Add personal notes to specific timestamps. A visual **yellow marker** appears on the progress bar.
* **Hover to Read:** Hover over markers to see your notes in a tooltip.
* **Click to Jump:** Click a marker to instantly jump to that moment.
* **Edit/Delete:** Right-click any marker to edit the text or delete the note.
* **Local Storage:** Notes are saved securely in your browser and reappear whenever you revisit the video.

### 2. 🔗 Smart Link Copy
Copies links that work perfectly everywhere.
* **Rich Text:** Pastes as a clickable hyperlink in Word, Notion, Google Docs.
* **Plain Text:** Pastes as text + URL in WhatsApp, Discord, Notepad.

### 3. 📸 Instant Screenshot
Captures a high-quality, clean screenshot of the exact video frame (without player controls/overlays) and copies it to your clipboard.

### 4. 📱 QR Code Generator
Instantly generates a QR code for the specific timestamp to share easily with mobile devices.

### 5. ⌨️ Keyboard Shortcuts
Control everything without touching your mouse:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Alt + A`** | **Add Note** | Opens a prompt to pin a note at the current time. |
| **`Alt + C`** | **Copy Link** | Copies formatted link to clipboard. |
| **`Alt + S`** | **Screenshot** | Copies a clean PNG image frame to clipboard. |
| **`Alt + Q`** | **QR Code** | Copies a QR code image to clipboard. |

## 🔧 Installation (Sideloading)

Since this extension is not on the Chrome Web Store, you need to load it manually.

1.  **Download the Project:** Clone or download this repository.
2.  **Download the Library:**
    * Download `qrcode.min.js` from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js).
    * Save it **directly inside** your project folder (next to `manifest.json`).
3.  **Load in Chrome:**
    * Go to `chrome://extensions`.
    * Enable **"Developer mode"** (top-right).
    * Click **"Load unpacked"** (top-left).
    * Select your project folder.

## 🚀 How to Use Notes

1.  Watch a video and pause at an important moment.
2.  Press **`Alt + A`** (or click "📌 Not Ekle" in the popup).
3.  Type your note and hit Enter.
4.  A **yellow marker** will appear on the timeline.
5.  **Right-Click** the marker later to Edit or Delete it.

## 💻 Technology Used

* **Chrome Storage API:** For saving your notes locally.
* **Canvas API:** For capturing video frames.
* **Clipboard API:** For smart copying (HTML/Text/Images).
* **DOM Manipulation:** For injecting markers into the YouTube player.
* **Manifest V3**
