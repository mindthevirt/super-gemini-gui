# Super Gemini Workspace 🚀

**Super Gemini Workspace** is a high-performance Chrome extension that transforms the official Google Gemini interface into a powerful, organized productivity hub. It adds a persistent, searchable, and customizable sidebar that lets you group chats into folders, pin your most important conversations, and hide the ones you don't need.

![Super Gemini Workspace Preview](https://github.com/user-attachments/assets/placeholder-image) *Replace with a real screenshot of your sidebar*

## ✨ Key Features

### 📁 Custom Workspaces (Folders)
Organize your chats by project, topic, or client. Drag and drop chats into custom folders to keep your sidebar clean and focused.

### 📌 Pinned Conversations
Keep your most frequent chats at the top. Use the "Star" icon to pin conversations to the Pinned section for instant access.

### 🔍 Global Search
Find any chat instantly. Our lightning-fast search filters across your Pinned chats, Workspace folders, and Recent Activity simultaneously.

### 🧪 Smart Badges
Automatically detects and badges **Deep Research** and **Gems** chats using native URL and aria-label heuristics, making it easy to identify advanced chat types.

### 🌓 Native Theme Support
Seamlessly matches your system's light or dark mode. The UI is built using CSS variables to ensure it feels like a native part of the Gemini ecosystem.

### 🛡️ Privacy & Performance First
- **Zero Server Side**: Your data never leaves your browser. All folder structures and pinned chats are stored in `chrome.storage.local`.
- **Silent Sync**: Unlike other extensions, Super Gemini Workspace scrapes your chat history silently without forcing the native sidebar to open or flicker.
- **GPU-Accelerated**: Smooth animations and transitions for a premium, jank-free experience.

### 💾 Backup & Restore
Moving to a new machine? Use the built-in Export/Import feature to backup your entire workspace configuration as a JSON file.

---

## 🚀 Getting Started (Developer Install)

Until this is on the Chrome Web Store, you can install it manually:

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/yourusername/super-gemini-workspace.git
    ```
2.  **Open Chrome Extensions**: Go to `chrome://extensions/` in your browser.
3.  **Enable Developer Mode**: Toggle the switch in the top-right corner.
4.  **Load Unpacked**: Click "Load unpacked" and select the `gemini-extension` folder from this repository.
5.  **Refresh Gemini**: Open [gemini.google.com](https://gemini.google.com) and start organizing!

---

## 🛠️ How It Works

The extension uses a "Silent Scraper" architecture:
- **Scraper**: A debounced `MutationObserver` watches the DOM for new chat links and updates the internal state.
- **View**: A vanilla JavaScript `render()` loop creates a custom sidebar and injects it into the page.
- **Styles**: Modern CSS with custom properties (`--var`) and high-performance transitions for folder expansion and interaction feedback.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, a new feature, or a UI enhancement, feel free to open a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
