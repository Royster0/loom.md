# Development Guide

This guide will help you set up your development environment and understand the development workflow for Loom.md.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Building](#building)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Rust** (latest stable)
   - Install via [rustup](https://rustup.rs/)
   - Verify: `rustc --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

### Platform-Specific Dependencies

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Windows

- **WebView2**: Usually pre-installed on Windows 10+
- **Visual Studio Build Tools**: Install C++ build tools from [Visual Studio](https://visualstudio.microsoft.com/downloads/)

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Royster0/Loom.md.git
cd Loom.md
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Rust dependencies are managed by Cargo (automatic)
```

### 3. Verify Setup

```bash
# Check if everything is installed correctly
npm run tauri dev --help
```

### 4. IDE Setup (Optional but Recommended)

#### VS Code

Install recommended extensions:
- **Rust Analyzer** - Rust language support
- **Tauri** - Tauri development tools
- **TypeScript and JavaScript Language Features** - Built-in
- **ESLint** - Code linting

**Settings** (`.vscode/settings.json`):
```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

---

## Project Structure

```
Loom.md/
├── src/                      # Frontend source
│   ├── lib/                 # Core application code
│   │   ├── editor/         # Editor modules
│   │   ├── file-tree/      # File tree components
│   │   ├── formatting/     # Text formatting
│   │   ├── settings/       # Settings management
│   │   ├── tabs/           # Tab system
│   │   ├── ui/             # UI components
│   │   ├── utils/          # Shared utilities
│   │   └── core/           # Core types and state
│   ├── styles/             # CSS stylesheets
│   ├── index.html          # Main HTML file
│   └── main.ts             # Application entry point
│
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── markdown/       # Markdown rendering
│   │   ├── config.rs       # Configuration
│   │   ├── file_watcher.rs # File watcher
│   │   ├── lib.rs          # Tauri commands
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
│
├── docs/                    # Documentation
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
└── README.md                # Main readme
```

---

## Development Workflow

### Running in Development Mode

```bash
npm run tauri dev
```

This will:
1. Start the Vite dev server (frontend)
2. Compile the Rust backend
3. Launch the application
4. Enable hot module reloading (HMR)

**Hot Reload**:
- Frontend changes reload automatically
- Rust changes require manual restart (`Ctrl+C` then `npm run tauri dev`)

### Making Changes

#### Frontend Changes

1. Edit TypeScript/CSS files in `src/`
2. Save the file
3. Browser auto-refreshes (HMR)
4. Test your changes

#### Backend Changes

1. Edit Rust files in `src-tauri/src/`
2. Save the file
3. Stop the dev server (`Ctrl+C`)
4. Restart: `npm run tauri dev`
5. Test your changes

### Adding New Features

1. **Plan**: Create or comment on a GitHub issue
2. **Branch**: `git checkout -b feature/your-feature`
3. **Implement**: Write code following style guidelines
4. **Test**: Manually test all affected functionality
5. **Commit**: Write clear commit messages
6. **Push**: `git push origin feature/your-feature`
7. **PR**: Create a pull request

---

## Building

### Development Build

```bash
npm run tauri build --debug
```

Produces a debug build with:
- Debug symbols
- Better error messages
- Faster compile time
- Larger binary size

### Production Build

```bash
npm run tauri build
```

Produces an optimized build with:
- Optimizations enabled
- Smaller binary size
- Slower compile time
- Production-ready

**Output Location**:
- Linux: `src-tauri/target/release/loom-md`
- macOS: `src-tauri/target/release/bundle/macos/Loom.md.app`
- Windows: `src-tauri/target/release/loom-md.exe`

### Build Artifacts

After building, you'll find installers in:
- `src-tauri/target/release/bundle/`

Types of installers:
- **Linux**: `.deb`, `.appimage`
- **macOS**: `.dmg`, `.app`
- **Windows**: `.msi`, `.exe`

---

## Testing

### Manual Testing

Currently, Loom.md relies on manual testing. Here's a checklist:

**File Operations**:
- [ ] Open a folder
- [ ] Create a new file
- [ ] Rename a file
- [ ] Delete a file
- [ ] Move a file (drag & drop)
- [ ] Copy/paste files

**Editor**:
- [ ] Type markdown
- [ ] Toggle edit/preview mode
- [ ] Paste text (single and multi-line)
- [ ] Insert image (paste, drag, drop)
- [ ] Save file (Ctrl+S)
- [ ] Switch between tabs

**File Tree**:
- [ ] Expand/collapse folders
- [ ] Multi-select files
- [ ] Context menu operations
- [ ] Drag and drop

**Settings**:
- [ ] Change theme
- [ ] Import/export theme
- [ ] Modify settings

### Adding Tests (Coming Soon)

Framework suggestions:
- **Frontend**: Vitest + Testing Library
- **Backend**: Rust's built-in test framework

Example test structure:
```typescript
// src/lib/utils/__tests__/path-utils.test.ts
import { describe, it, expect } from 'vitest';
import { getFilename } from '../path-utils';

describe('getFilename', () => {
  it('extracts filename from path', () => {
    expect(getFilename('/path/to/file.md')).toBe('file.md');
  });
});
```

---

## Debugging

### Frontend Debugging

**Chrome DevTools**:
1. Run `npm run tauri dev`
2. Right-click in the app → "Inspect Element"
3. Use Console, Network, Sources tabs

**VS Code Debugging**:
1. Install "JavaScript Debugger" extension
2. Set breakpoints in TypeScript files
3. Press F5 to start debugging

**Console Logging**:
```typescript
console.log('Debug info:', variable);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### Backend Debugging

**Print Debugging**:
```rust
println!("Debug: {:?}", variable);
eprintln!("Error: {}", error);
```

**Rust Debugger** (VS Code):
```bash
# Install CodeLLDB extension
# Add launch.json configuration
```

**Logging**:
```rust
// Enable in Cargo.toml
[dependencies]
env_logger = "0.10"

// Use in code
use log::{debug, error, info, warn};

info!("Application started");
debug!("Debug info: {:?}", data);
```

### Common Debugging Scenarios

**1. Tauri Command Not Working**

Check:
- Command is listed in `invoke_handler!` macro
- Function signature matches expected parameters
- Return type is correct

**2. Frontend Not Updating**

Check:
- File is being watched by Vite
- No TypeScript errors
- Browser cache (hard refresh: Ctrl+Shift+R)

**3. Build Failures**

Check:
- All dependencies installed
- TypeScript compilation succeeds: `npm run build`
- Rust compilation succeeds: `cd src-tauri && cargo build`

---

## Common Tasks

### Adding a New Tauri Command

1. **Define the command** in `src-tauri/src/lib.rs`:
   ```rust
   #[tauri::command]
   fn my_command(param: String) -> Result<String, String> {
       Ok(format!("Received: {}", param))
   }
   ```

2. **Register the command**:
   ```rust
   .invoke_handler(tauri::generate_handler![
       // ... existing commands
       my_command,
   ])
   ```

3. **Call from frontend**:
   ```typescript
   import { invoke } from '@tauri-apps/api/core';

   const result = await invoke<string>('my_command', { param: 'test' });
   ```

### Adding a New UI Module

1. **Create the file**: `src/lib/feature/feature.ts`
2. **Define exports**:
   ```typescript
   export function initFeature() {
       // Initialization code
   }
   ```

3. **Import and use** in `main.ts`:
   ```typescript
   import { initFeature } from './lib/feature/feature';

   initFeature();
   ```

### Adding Dependencies

**Frontend**:
```bash
npm install package-name
npm install -D package-name  # Dev dependency
```

**Backend**:
```bash
cd src-tauri
cargo add package-name
```

Or edit `Cargo.toml`:
```toml
[dependencies]
package-name = "version"
```

### Updating Dependencies

```bash
# Update all Node.js dependencies
npm update

# Update Rust dependencies
cd src-tauri
cargo update
```

---

## Best Practices

### Code Organization

1. **Single Responsibility**: Each module should have one clear purpose
2. **DRY Principle**: Extract common code into utilities
3. **Type Safety**: Use TypeScript types, avoid `any`
4. **Documentation**: Add JSDoc comments for public APIs

### Performance

1. **Lazy Loading**: Load modules on demand
2. **Debouncing**: Debounce frequent operations
3. **Caching**: Cache computed values when appropriate
4. **Batch Operations**: Batch multiple calls to backend

### Security

1. **Input Validation**: Validate all user inputs
2. **Path Sanitization**: Sanitize file paths
3. **Permission Checks**: Check permissions before operations
4. **No Dynamic Execution**: Avoid `eval()` and similar

### Git Workflow

1. **Branch Naming**:
   - Features: `feature/description`
   - Fixes: `fix/description`
   - Docs: `docs/description`

2. **Commit Messages**:
   - Use conventional commits
   - Be descriptive
   - Reference issues

3. **Pull Requests**:
   - Keep changes focused
   - Update documentation
   - Respond to reviews promptly

---

## Troubleshooting

### Build Errors

**"command not found: tauri"**
```bash
npm install  # Reinstall dependencies
```

**"failed to bundle project"**
```bash
# Clean build artifacts
rm -rf src-tauri/target
npm run tauri build
```

**TypeScript errors**
```bash
# Check for errors
npm run build

# Fix common issues
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**"Cannot find module"**
- Check import paths
- Verify file exists
- Check case sensitivity

**"Tauri command not found"**
- Verify command is registered
- Check spelling matches exactly
- Rebuild backend

**Performance Issues**
- Check browser console for errors
- Monitor memory usage
- Profile with DevTools

### Platform-Specific Issues

**Linux**: "failed to load libwebkit2gtk"
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

**macOS**: "code signature invalid"
```bash
# Remove quarantine attribute
xattr -r -d com.apple.quarantine /path/to/app
```

**Windows**: "VCRUNTIME140.dll missing"
- Install Visual C++ Redistributable

---

## Resources

### Documentation
- [Tauri Docs](https://tauri.app/v1/guides/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [Tauri CLI](https://tauri.app/v1/api/cli)
- [Rust Analyzer](https://rust-analyzer.github.io/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### Community
- [GitHub Issues](https://github.com/Royster0/Loom.md/issues)
- [GitHub Discussions](https://github.com/Royster0/Loom.md/discussions)
- [Tauri Discord](https://discord.gg/tauri)

---

## Next Steps

1. Read the [Architecture Documentation](ARCHITECTURE.md)
2. Check the [Contributing Guide](../CONTRIBUTING.md)
3. Browse [Open Issues](https://github.com/Royster0/Loom.md/issues)
4. Join the community discussions

Happy coding! 🚀
