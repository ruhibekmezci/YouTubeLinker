# 📺 YouTube Linker & Study Assistant

<table align="center">
  <tr>
    <td><img src="https://github.com/user-attachments/assets/d537397f-3dae-42b4-a239-4b9ecf7d8cca" width="350" alt="img1"></td>
    <td><img src="https://github.com/user-attachments/assets/61ae7806-4e5b-4260-892b-108e1d591cf7" width="350" alt="img2"></td>
  </tr>
</table>


**The ultimate productivity tool for YouTube learners, researchers, and power users.**

[Features](#-key-features) • [Installation](#-installation) • [Usage](#-keyboard-shortcuts-hotkeys)

![Chrome](https://img.shields.io/badge/Chrome-Extension-googlechrome?style=flat&logo=google-chrome)
![Manifest](https://img.shields.io/badge/Manifest-V3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

</div>

---

## 💡 What is it?

**YouTube Linker** is not just a link copier. It transforms YouTube into a **personal study station**. 

It allows you to **pin notes** directly onto the video timeline, capture clean **screenshots** of specific frames, generate **QR codes** for mobile sharing, and manage everything in a searchable **Local Library**.

No accounts needed. No cloud sync. **100% Local & Private.**

---

## ✨ Key Features

<img width="961" height="617" alt="image" src="https://github.com/user-attachments/assets/a367f583-ede5-4ac7-81bd-b3106fca3747" />


### 1. 📝 Timeline Notes (The "Sticky Note" Feature)
Don't just watch; interact. Press `Alt + A` to pin a note to the exact second you are watching.
* **Visual Markers:** Yellow markers appear on the progress bar.
* **Hover Preview:** Hover over markers to read your notes instantly.
* **Edit/Delete:** Right-click any marker to modify.

![Timelinenotes3](https://github.com/user-attachments/assets/6495726c-871a-4c8c-a30c-c0a6babcf323)

### 2. 🔗 Smart Link Copy
Solves the "WhatsApp vs. Word" problem.
* **Rich Text:** Pastes as a clickable hyperlink in **Notion, Word, Google Docs**.
* **Plain Text:** Pastes as `Title + URL` in **WhatsApp, Discord, VS Code**.
* 
![smartlinkcopy](https://github.com/user-attachments/assets/2d5d54fc-32bc-4349-aa6f-0d054f89f0a7)

### 3. 📸 Intelligent Screenshot
Captures the raw video frame without the player controls (play button, progress bar, gradients).
* **Auto-Save:** If you take a screenshot (`Alt+S`) and immediately add a note (`Alt+A`), the image is **attached to your note** automatically!

![screenshot](https://github.com/user-attachments/assets/25bf91c0-2557-443b-806b-e6b599f2f5c4)


### 4. 📚 The Library (Options Page)
A powerful dashboard to manage your knowledge.
* **Search:** Filter by video title, note content, or descriptions.
* **Detailed Descriptions:** Add expandable/collapsible detailed notes (up to 250 chars) for every timestamp.
* **Visual Gallery:** View your attached screenshots directly in the list.

![optionspage1](https://github.com/user-attachments/assets/d4360277-eb4f-401d-9710-beb6cb7640b5)
![optionspage2](https://github.com/user-attachments/assets/607b8df0-04f1-435f-8327-b1fe95bd98c3)

### 5. 📱 QR Code Generator
Instantly generate a QR code for the current timestamp to continue watching on your phone.

![qrcodegenerate](https://github.com/user-attachments/assets/c5e5d947-79dc-4a5d-924f-2c71d0a67d40)


## 🚀 Keyboard Shortcuts (Hotkeys)

Master the extension without touching your mouse:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Alt + A`** | **Add Note** | Pins a note to the current timestamp. |
| **`Alt + C`** | **Copy Link** | Copies smart link to clipboard. |
| **`Alt + S`** | **Screenshot** | Copies clean frame to clipboard & memory. |
| **`Alt + Q`** | **QR Code** | Copies QR image to clipboard. |

---

## 🔧 Installation

Since this is a powerful developer tool, it is installed via "Developer Mode".

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/USERNAME/YouTubeLinker.git](https://github.com/USERNAME/YouTubeLinker.git)
    ```
2.  **Download Dependency:**
    * Download `qrcode.min.js` from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js).
    * Place it **inside the project folder** (same level as `manifest.json`).
3.  **Load in Chrome:**
    * Go to `chrome://extensions`.
    * Enable **Developer mode** (top right).
    * Click **Load unpacked**.
    * Select the project folder.

---

## 📂 Data & Privacy

* **Storage:** All data (notes, images, links) is stored in your browser's `Local Storage`.
* **Unlimited Storage:** The extension uses the `unlimitedStorage` permission to save high-quality screenshots and thousands of notes.
* **Privacy:** No data is sent to any external server. It stays on your machine.

---

## 🤝 Contributing

Feel free to open issues or pull requests if you have ideas to make this assistant even smarter!

**Developed with ❤️ for productive learning.**
