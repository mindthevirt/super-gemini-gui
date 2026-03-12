# Super Gemini Workspace 🚀

**Super Gemini Workspace** transforms the official Google Gemini interface into a high-performance, organized productivity hub. Add folders, pin chats, and search your entire history instantly.

---

## ⚡ Quick Start (Get it running in 60 seconds)

1. **Download**: [Download this repo as a ZIP](https://github.com/mindthevirt/super-gemini-gui/archive/refs/heads/main.zip) and unzip it.
2. **Install**: Go to `chrome://extensions/`, enable **Developer mode**, and click **Load unpacked**.
3. **Select**: Choose the `gemini-extension` folder from the unzipped files.
4. **Go**: Refresh [gemini.google.com](https://gemini.google.com) and start organizing!

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🛡️ Privacy & Performance](#️-privacy--performance)
- [🚀 Detailed Installation](#-detailed-installation)
- [🛠️ How It Works](#️-how-it-works)
- [💾 Backup & Restore](#-backup--restore)
- [📜 License](#-license)
- [🤝 Contributing](#-contributing)

---

## ✨ Key Features

### 📁 Custom Workspaces (Folders)
Organize your chats by project, topic, or client. Drag and drop chats into custom folders to keep your sidebar clean and focused.

### 📌 Pinned Conversations
Keep your most frequent chats at the top. Use the "Star" icon to pin conversations to the Pinned section for instant access.

### 🔍 Global Search
Find any chat instantly. Our lightning-fast search filters across your Pinned chats, Workspace folders, and Recent Activity simultaneously.

### 🧪 Smart Badges
Automatically detects and badges **Deep Research** and **Gems** chats using native URL and aria-label heuristics.

### 🌓 Native Theme Support
Seamlessly matches your system's light or dark mode using modern CSS variables.

---

## 🛡️ Privacy & Performance

- **100% Private**: Your data never leaves your browser. All folder structures and pinned chats are stored locally in `chrome.storage.local`.
- **Silent Sync**: Scrapes your chat history silently without forcing the native sidebar to open or flicker.
- **GPU-Accelerated**: Smooth 60fps animations and transitions for a premium experience.

---

## 🚀 Detailed Installation

### Developer Install (Recommended)
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/mindthevirt/super-gemini-gui.git
   ```
2. **Open Extensions**: Navigate to `chrome://extensions/`.
3. **Enable Developer Mode**: Toggle the switch in the top-right corner.
4. **Load Extension**: Click **Load unpacked** and select the `gemini-extension` folder.
5. **Refresh**: Open [Gemini](https://gemini.google.com) to see your new workspace.

---

## 🛠️ How It Works

The extension uses a unique "Silent Scraper" architecture:
- **Scraper**: A debounced `MutationObserver` watches for new chat links and updates the internal state.
- **View**: A vanilla JavaScript `render()` loop creates a custom sidebar and injects it into the page.
- **Styles**: Modern CSS with custom properties (`--var`) and high-performance transitions.

---

## 💾 Backup & Restore
Moving to a new machine? Use the built-in Export/Import feature (⚙️ icon) to backup your entire workspace configuration as a JSON file.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are welcome! 
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
