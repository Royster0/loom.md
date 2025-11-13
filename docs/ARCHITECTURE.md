# Architecture Documentation

This document describes the technical architecture of Loom.md, providing insights into the design decisions, module organization, and data flow.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Module Details](#module-details)
- [Performance Optimizations](#performance-optimizations)
- [Security Considerations](#security-considerations)

---

## Overview

Loom.md is a desktop Markdown editor built using the Tauri framework, which combines a Rust backend with a TypeScript/HTML/CSS frontend. This hybrid approach provides:

- **Native performance** from Rust
- **Modern UI development** with TypeScript
- **Small binary size** compared to Electron
- **Enhanced security** through Tauri's permissions system

### Design Principles

1. **Performance First**: Optimized for speed and low resource usage
2. **Modular Architecture**: Single-responsibility modules for maintainability
3. **Type Safety**: TypeScript on frontend, strong typing in Rust
4. **Clean Separation**: Clear boundaries between UI and business logic
5. **Extensibility**: Easy to add new features without breaking existing code

---

## Technology Stack

### Frontend
- **TypeScript** 5.6+ - Type-safe JavaScript
- **HTML5/CSS3** - Modern web standards
- **Vite** - Fast build tool with HMR
- **KaTeX** - Math rendering

### Backend
- **Rust** - Systems programming language
- **Tauri 2.0** - Desktop framework
- **pulldown-cmark** - CommonMark parser
- **rayon** - Data parallelism library
- **notify** - File system watcher
- **serde** - Serialization framework

### Build & Tools
- **npm** - Package management
- **Cargo** - Rust build system
- **rustfmt** - Code formatting
- **TypeScript Compiler** - Type checking

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (TypeScript)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Editor  │  │File Tree │  │   Tabs   │  │ Settings │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                         │                                     │
│                    ┌────▼─────┐                              │
│                    │   Core   │                              │
│                    │  State   │                              │
│                    └────┬─────┘                              │
└─────────────────────────┼───────────────────────────────────┘
                          │
                   ┌──────▼────────┐
                   │  Tauri Bridge │
                   │   (IPC/RPC)   │
                   └──────┬────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Backend (Rust)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Markdown    │  │     File     │  │    Config    │     │
│  │  Rendering   │  │  Operations  │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │     File     │  │    Image     │                        │
│  │   Watcher    │  │   Storage    │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────────────────────────────────────────────┘
                          │
                   ┌──────▼────────┐
                   │  File System  │
                   └───────────────┘
```

---

## Frontend Architecture

### Module Organization

The frontend is organized into focused modules following the single-responsibility principle:

```
src/lib/
├── editor/              # Editor functionality
│   ├── editor-events.ts        # Event coordination
│   ├── image-handling.ts       # Image paste/drop
│   ├── text-paste.ts          # Text paste logic
│   ├── cursor-management.ts   # Cursor handling
│   ├── editor-input.ts        # Input processing
│   ├── editor-keys.ts         # Keyboard handlers
│   ├── editor-utils.ts        # Helper functions
│   └── rendering.ts           # Markdown rendering coordination
│
├── file-tree/           # File tree components
│   ├── file-tree-ui.ts        # UI coordination
│   ├── file-tree-render.ts    # Tree rendering
│   ├── file-tree-selection.ts # Multi-select logic
│   ├── file-tree-drag-drop.ts # Drag & drop
│   ├── file-tree-clipboard.ts # Copy/cut/paste
│   ├── file-tree-core.ts      # Core logic
│   ├── context-menu.ts        # Context menus
│   └── sidebar.ts             # Sidebar resize
│
├── utils/               # Shared utilities
│   ├── path-utils.ts          # Path operations
│   └── cursor-utils.ts        # Cursor utilities
│
├── formatting/          # Text formatting
│   ├── markdown-formatting.ts # MD operations
│   ├── text-editing-utils.ts  # Text utils
│   ├── formatting.ts          # Format handlers
│   └── view-controls.ts       # View toggles
│
├── tabs/                # Tab management
│   └── tabs.ts               # Tab logic
│
├── settings/            # Settings system
│   ├── settings-manager.ts   # Settings CRUD
│   ├── settings-ui.ts        # Settings UI
│   ├── theme.ts              # Theme management
│   └── keybinds.ts           # Keybind config
│
├── ui/                  # UI components
│   ├── ui.ts                 # Main UI
│   ├── window-controls.ts    # Window management
│   └── welcome-screen.ts     # Welcome UI
│
└── core/                # Core infrastructure
    ├── state.ts              # Global state
    ├── types.ts              # Type definitions
    └── dom.ts                # DOM references
```

### State Management

Global state is centralized in `core/state.ts`:

```typescript
interface AppState {
  currentFile: string | null;      // Active file path
  currentFolder: string | null;    // Open folder
  content: string;                 // Editor content
  isDirty: boolean;                // Unsaved changes
  editMode: boolean;               // Edit vs preview
  currentLine: number | null;      // Cursor line
  // ... settings and config
}
```

State updates flow unidirectionally:
1. User action → Event handler
2. Event handler → State update
3. State update → UI re-render

### Event Flow

```
User Input
    ↓
Event Listener (editor-events.ts)
    ↓
Handler Function (specific module)
    ↓
State Update (core/state.ts)
    ↓
UI Update (rendering/UI modules)
```

---

## Backend Architecture

### Tauri Command System

The backend exposes commands via Tauri's IPC mechanism:

```rust
#[tauri::command]
fn command_name(param: Type) -> Result<ReturnType, String> {
    // Implementation
}
```

### Key Modules

#### 1. Markdown Rendering (`src-tauri/src/markdown/`)

**Purpose**: Convert Markdown to HTML with syntax highlighting and math support

**Components**:
- `mod.rs` - Main parser and coordinator
- `inline_rendering.rs` - Inline elements (links, emphasis, code)
- `block_detection.rs` - Block-level elements (code blocks, math blocks)

**Flow**:
```
Raw Markdown
    ↓
pulldown-cmark Parser
    ↓
Event Stream
    ↓
Custom Renderers (inline/block)
    ↓
HTML Output
```

**Optimization**: Parallel rendering with `rayon` for batches >50 lines

#### 2. File Operations (`src-tauri/src/lib.rs`)

**Commands**:
- `read_directory` - List directory contents
- `read_file_from_path` - Read file content
- `create_file` / `create_folder` - Create new items
- `delete_file` / `delete_folder` - Delete items
- `rename_path` - Rename files/folders
- `move_path` - Move items
- `copy_path` - Copy items recursively
- `is_image_file` - Validate image extensions
- `save_image_from_clipboard` - Save pasted images

#### 3. Configuration Management (`src-tauri/src/config.rs`)

**Features**:
- Per-folder `.loom/config.json` storage
- Theme management (import/export)
- Settings persistence
- Default theme generation

**Structure**:
```
.loom/
├── config.json      # App settings
└── themes/          # Custom themes
    ├── dark.json
    ├── light.json
    └── custom.json
```

#### 4. File Watcher (`src-tauri/src/file_watcher.rs`)

**Purpose**: Detect external file system changes

**Features**:
- Uses `notify` crate for cross-platform FS events
- Debounced events to prevent spam
- Emits events to frontend via Tauri
- Automatic cleanup on directory change

---

## Data Flow

### Opening a File

```
1. User clicks file in tree
   ↓
2. loadFileContent() called (file-operations.ts)
   ↓
3. Invoke Rust command: read_file_from_path
   ↓
4. Rust reads file from disk
   ↓
5. Returns content to frontend
   ↓
6. Frontend updates state and opens in tab
   ↓
7. Markdown rendering initiated
   ↓
8. Editor displays content
```

### Saving a File

```
1. User presses Ctrl+S or auto-save triggers
   ↓
2. saveFile() called (file-operations.ts)
   ↓
3. Invoke Rust command: writeTextFile (Tauri plugin)
   ↓
4. Rust writes content to disk
   ↓
5. Success/error returned
   ↓
6. Frontend marks tab as clean (not dirty)
   ↓
7. UI updates to remove unsaved indicator
```

### Markdown Rendering

```
1. User types in editor
   ↓
2. Input event fired (editor-input.ts)
   ↓
3. Current line content extracted
   ↓
4. Invoke Rust command: render_markdown
   ↓
5. Rust parses markdown
   ↓
6. Returns HTML
   ↓
7. Frontend updates line innerHTML
   ↓
8. Cursor position restored
```

### Batch Rendering (Multi-line)

```
1. Paste or file load triggers batch render
   ↓
2. Collect all line render requests
   ↓
3. Invoke Rust command: render_markdown_batch
   ↓
4. Rust processes in parallel (if >50 lines)
   ↓
5. Returns array of HTML strings
   ↓
6. Frontend updates all lines
```

---

## Module Details

### Editor Module

**Responsibilities**:
- Handle user input (typing, paste, shortcuts)
- Manage cursor position
- Coordinate markdown rendering
- Handle image insertion

**Key Files**:
- `editor-events.ts` - Event coordination and initialization
- `image-handling.ts` - Image paste/drop with base64 encoding
- `text-paste.ts` - Multi-line paste handling
- `cursor-management.ts` - Cursor position tracking
- `editor-input.ts` - Input processing and re-rendering

**Design Pattern**: Event-driven with centralized coordination

### File Tree Module

**Responsibilities**:
- Display folder structure
- Handle file operations (CRUD)
- Multi-select functionality
- Drag & drop operations
- Clipboard operations (copy/cut/paste)

**Key Files**:
- `file-tree-render.ts` - DOM generation
- `file-tree-selection.ts` - Selection state management
- `file-tree-drag-drop.ts` - D&D logic
- `file-tree-clipboard.ts` - Copy/cut/paste

**Design Pattern**: State management with separated concerns

### Utils Module

**Responsibilities**:
- Provide reusable utility functions
- Eliminate code duplication
- Centralize common operations

**Key Files**:
- `path-utils.ts` - Path manipulation (separator detection, filename extraction, image validation)
- `cursor-utils.ts` - Cursor operations (save/restore position, node traversal)

**Design Pattern**: Pure functions with no side effects

---

## Performance Optimizations

### Frontend

1. **Modular Code Splitting**
   - Separated large files into focused modules
   - Enables better tree-shaking
   - Smaller bundle sizes

2. **Incremental Rendering**
   - Only re-render changed lines
   - Cursor position preservation
   - Minimal DOM manipulation

3. **Debounced Operations**
   - File system operations debounced
   - Prevents excessive backend calls

4. **Efficient DOM Updates**
   - Direct innerHTML updates instead of frameworks
   - Cached DOM references
   - RequestAnimationFrame for cursor restoration

### Backend

1. **Parallel Processing**
   - Batch rendering uses `rayon` for parallelism
   - Threshold: >50 lines triggers parallel mode
   - Significant speedup for large files

2. **Lazy Loading**
   - File tree loads children on demand
   - Prevents loading entire tree upfront

3. **Efficient Parsing**
   - `pulldown-cmark` is one of the fastest MD parsers
   - Zero-copy parsing where possible
   - Streaming event-based architecture

4. **Optimized File Operations**
   - Direct file system access via Rust
   - No intermediate serialization overhead
   - Efficient recursive directory operations

---

## Security Considerations

### Tauri Security Model

1. **Sandboxed Runtime**
   - Frontend runs in WebView sandbox
   - Limited file system access
   - Explicit permissions required

2. **Command Allowlist**
   - Only exposed Tauri commands are callable
   - Type-safe parameters
   - Validation on both sides

3. **Path Validation**
   - All file paths validated before access
   - Hidden files skipped (starts with `.`)
   - Parent directory checks prevent traversal attacks

4. **Input Sanitization**
   - HTML escape for markdown output
   - File name sanitization (removes dangerous characters: `<>:"/\|?*`)
   - Image size validation (max 10MB)

### Best Practices Implemented

- No `eval()` or dynamic code execution
- CSP (Content Security Policy) configured
- No inline scripts in HTML
- Secure WebView configuration
- No remote code loading

---

## Future Architecture Considerations

### Plugin System

**Proposed Architecture**:
```
Plugin API
    ↓
Plugin Manager
    ↓
├── Editor Plugins
├── Renderer Plugins
├── File Handler Plugins
└── UI Extension Plugins
```

**Considerations**:
- Sandboxed plugin execution
- IPC-based plugin communication
- Permission system for plugins
- Plugin discovery and marketplace

### Collaborative Editing

**Proposed Architecture**:
- Operational Transform (OT) or CRDT for conflict resolution
- WebSocket connection for real-time sync
- User presence indicators
- Cursor position sharing

### Cloud Sync

**Proposed Architecture**:
- Abstract sync layer
- Multiple backend support (Dropbox, Google Drive, custom)
- Conflict resolution UI
- Offline-first with sync queue

---

## Conclusion

Loom.md's architecture prioritizes:
- **Performance** through Rust backend and optimized frontend
- **Maintainability** via modular design and clear separation
- **Security** using Tauri's sandboxed model
- **Extensibility** with well-defined module boundaries

This foundation enables rapid feature development while maintaining code quality and performance.

For more information, see:
- [Development Guide](DEVELOPMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [User Guide](USER_GUIDE.md)
