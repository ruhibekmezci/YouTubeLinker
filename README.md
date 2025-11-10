# YouTubeLinker
A simple Chrome extension to copy a video title and current timestamp from any YouTube video, formatted as a clickable hyperlink.

# YouTube Timestamp Linker

A lightweight Chrome extension designed to help you quickly create and copy timestamped links from YouTube videos. When you're on a YouTube video page and click the extension icon, it automatically copies a rich-text (hyperlink) of the video's title and the **exact current time** to your clipboard.

This is the perfect tool for taking notes, sharing specific moments, or building a research library from YouTube content.

### Example Output

When pasted into applications like Google Docs, Word, Notion, or an email, the output looks like this:

> **"A Guide to Modern JavaScript" minute: 04:32**

This text is a **clickable hyperlink** that will take anyone directly to that video at the 4:32 mark.

## ✨ Features

* **Rich-Text Hyperlink:** Copies a clickable link, not just plain text.
* **Current Timestamp:** Grabs the *current* time you are at in the video, not the total duration.
* **Wide Compatibility:** Works seamlessly with:
    * Regular YouTube videos (`/watch`)
    * YouTube Shorts (`/shorts`)
    * Mobile (`m.youtube.com`) and non-WWW (`youtube.com`) links.
* **Simple Format:** Formats the link as: `"Video Title" minute: mm:ss`.
* **Easy to Use:** Just click the icon, and the link is on your clipboard.

## 🔧 How to Install (Sideloading)

Since this extension is not on the Chrome Web Store, you need to load it manually in developer mode.

1.  Download or clone this repository to your local machine (e.g., `C:\Projects\YouTubeLinker`).
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **"Developer mode"** using the toggle switch in the top-right corner.
4.  Click the **"Load unpacked"** button that appears on the top-left.
5.  Select the folder where you saved the project files (the folder containing `manifest.json`).
6.  The extension is now installed! You can pin it to your toolbar for easy access.

## 🚀 How to Use

1.  Go to any YouTube video (or Short).
2.  Pause the video at the exact moment you want to link to.
3.  Click the extension icon (the YouTube logo) in your Chrome toolbar.
4.  A popup will confirm: `"Link olarak kopyalandı!"` (Link copied!).
5.  Paste (Ctrl+V) the link into your document (Word, Google Docs, etc.).

## 💻 Technology Used

* HTML5
* CSS3
* JavaScript (ES6+)
* Chrome Extension Manifest V3 API
    * `content_scripts` for reading page data.
    * `tabs` for getting the URL.
    * `clipboardWrite` for copying rich text.
