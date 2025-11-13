# Loom.md

<div align="center">

**A lightweight, fast, and beautiful Markdown editor for your thoughts**

[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-FFC131?logo=tauri)](https://tauri.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## ✨ Features

### 📝 Markdown Editing
- **Live Preview**: See your formatted markdown as you type
- **Dual Mode**: Toggle between editing and preview modes
- **Syntax Highlighting**: Code blocks with proper syntax support
- **Math Support**: LaTeX/KaTeX rendering for mathematical expressions
- **GFM Support**: Full GitHub Flavored Markdown compatibility

### 🗂️ File Management
- **File Tree Navigation**: Visual folder browser with expand/collapse
- **Multi-Tab Support**: Work on multiple files simultaneously
- **Drag & Drop**: Drag files and images directly into the editor
- **Multi-Select**: Select and manage multiple files at once
- **Auto-Save**: Never lose your work
- **File Watcher**: Automatic refresh when files change externally

### 🎨 Customization
- **Theme System**: Built-in dark and light themes
- **Custom Themes**: Import and create your own themes
- **Configurable Settings**: Per-folder configuration support
- **Keyboard Shortcuts**: Fully customizable keybindings

### 🖼️ Rich Media
- **Image Paste**: Paste images directly from clipboard
- **Image Drag & Drop**: Drop images from file explorer
- **Image Preview**: Inline image rendering
- **Automatic Image Storage**: Configurable image save location

### 🚀 Performance
- **Instant Startup**: Native performance with Tauri
- **Low Memory**: Efficient Rust backend
- **Parallel Rendering**: Multi-threaded markdown processing
- **Optimized Bundles**: Tree-shaken, modular code architecture

### 💡 Developer-Friendly
- **Clean Architecture**: Well-organized, maintainable codebase
- **TypeScript**: Type-safe frontend development
- **Modular Design**: Single-responsibility modules
- **Extensible**: Easy to add new features

---

## 📦 Installation

### Download Pre-built Binaries
*(Coming soon)*

Download the latest release for your platform from the [Releases](https://github.com/Royster0/Loom.md/releases) page.

### Build from Source

#### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Rust](https://www.rust-lang.org/) (latest stable)
- Platform-specific dependencies:
  - **Linux**: `webkit2gtk-4.1`, `libgtk-3-dev`, `libayatana-appindicator3-dev`
    ```bash
    # Ubuntu/Debian
    sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev
    ```
  - **macOS**: Xcode Command Line Tools
    ```bash
    xcode-select --install
    ```
  - **Windows**: WebView2 (usually pre-installed on Windows 10+)

#### Build Steps

```bash
# Clone the repository
git clone https://github.com/Royster0/Loom.md.git
cd Loom.md

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

The compiled application will be in `src-tauri/target/release/`.

---

## 🎯 Usage

### Quick Start

1. **Open a Folder**: `Ctrl/Cmd + Shift + O` to open a folder
2. **Create a File**: Right-click in the file tree → "New Markdown File"
3. **Start Writing**: Click on the file to open it in the editor
4. **Save**: `Ctrl/Cmd + S` to save your work

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | `Ctrl/Cmd + N` |
| Open File | `Ctrl/Cmd + O` |
| Save File | `Ctrl/Cmd + S` |
| Close Tab | `Ctrl/Cmd + W` |
| Toggle Edit Mode | Click toggle button |
| Copy (in file tree) | `Ctrl/Cmd + C` |
| Cut (in file tree) | `Ctrl/Cmd + X` |
| Paste (in file tree) | `Ctrl/Cmd + V` |
| Select All (in file tree) | `Ctrl/Cmd + A` |

### File Operations

- **Create**: Right-click in file tree → "New Markdown File" / "New Folder"
- **Rename**: Right-click file → "Rename"
- **Delete**: Right-click file → "Delete"
- **Move**: Drag and drop files between folders
- **Multi-select**:
  - `Ctrl/Cmd + Click` to toggle selection
  - `Shift + Click` for range selection
  - Drag multiple files at once

### Working with Images

- **Paste**: Copy an image and paste into the editor (`Ctrl/Cmd + V`)
- **Drag & Drop**: Drag image files from your file explorer into the editor
- **From File Tree**: Drag image files from the file tree into the editor
- **Configuration**: Set image save location in Settings → Custom Settings

---

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive feature guide
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and workflow
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture
- **[Contributing](CONTRIBUTING.md)** - How to contribute

---

## 🏗️ Architecture

Loom.md is built with a modern, performant stack:

- **Frontend**: TypeScript + HTML + CSS
- **Backend**: Rust (via Tauri)
- **Markdown Parser**: pulldown-cmark (fast CommonMark parser)
- **Math Rendering**: KaTeX
- **Build Tool**: Vite
- **Desktop Framework**: Tauri 2.0

### Project Structure

```
Loom.md/
├── src/                    # Frontend TypeScript code
│   ├── lib/
│   │   ├── editor/        # Editor modules (events, rendering, input)
│   │   ├── file-tree/     # File tree components
│   │   ├── formatting/    # Text formatting utilities
│   │   ├── settings/      # Settings management
│   │   ├── tabs/          # Tab management
│   │   ├── ui/            # UI components
│   │   ├── utils/         # Shared utilities
│   │   └── core/          # Core state and types
│   ├── styles/            # CSS stylesheets
│   └── main.ts            # Application entry point
├── src-tauri/             # Rust backend
│   └── src/
│       ├── markdown/      # Markdown rendering engine
│       ├── config.rs      # Configuration management
│       ├── file_watcher.rs # File system watcher
│       └── lib.rs         # Tauri commands
└── docs/                  # Documentation
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run tauri dev

# Build TypeScript
npm run build

# Build the app
npm run tauri build
```

---

## 🗺️ Roadmap

### Current Features (v0.1.0)
- ✅ File tree navigation with multi-select
- ✅ Multi-tab support
- ✅ Live markdown preview
- ✅ Image paste and drag & drop
- ✅ Theme system
- ✅ Settings management
- ✅ File watcher
- ✅ Keyboard shortcuts

### Planned Features
- [ ] Search and replace across files
- [ ] Export to PDF/HTML
- [ ] Plugin system
- [ ] Git integration
- [ ] Collaborative editing
- [ ] Cloud sync integration
- [ ] Advanced markdown extensions
- [ ] Custom keyboard shortcut editor
- [ ] Command palette
- [ ] Split view editing

---

## 🐛 Known Issues

See the [Issues](https://github.com/Royster0/Loom.md/issues) page for known bugs and feature requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Tauri](https://tauri.app/) - Build smaller, faster desktop apps
- [pulldown-cmark](https://github.com/raphlinus/pulldown-cmark) - Fast CommonMark parser
- [KaTeX](https://katex.org/) - Fast math typesetting
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Royster0/Loom.md/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Royster0/Loom.md/discussions)

---

<div align="center">

Made with ❤️ by the Loom.md contributors

[⬆ Back to top](#loommd)

</div>
