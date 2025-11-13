# Loom.md User Guide

Welcome to Loom.md! This comprehensive guide will help you get the most out of your Markdown editing experience.

## Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Working with Files](#working-with-files)
- [Editing Markdown](#editing-markdown)
- [Working with Images](#working-with-images)
- [Tab Management](#tab-management)
- [Customization](#customization)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips & Tricks](#tips--tricks)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Launch

When you first open Loom.md, you'll see the welcome screen with options to:
- **Open Folder**: Browse and select a folder to work with
- **Recent Folders**: Quickly access recently opened folders (after first use)

### Opening a Folder

1. Click **"Open Folder"** or press `Ctrl/Cmd + Shift + O`
2. Navigate to your desired folder
3. Click **"Select Folder"**
4. The file tree will populate with your files and folders

**Tip**: Loom.md works best when you open the root folder of your project or knowledge base.

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────┐
│ Title Bar          [○] [□] [×]                          │
├──────────┬──────────────────────────────────────────────┤
│          │ Tab 1  │ Tab 2  │                    ⚙️  ✎   │
│ File     ├──────────────────────────────────────────────┤
│ Tree     │                                              │
│          │                                              │
│ 📁 Folder│           Editor Area                       │
│  📄 File │                                              │
│  📄 File │                                              │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Components

1. **Title Bar**: Window controls (minimize, maximize, close)
2. **Tab Bar**: Open files as tabs
3. **Settings Icon** (⚙️): Access settings panel
4. **Edit Mode Toggle** (✎): Switch between edit and preview modes
5. **File Tree**: Navigate your files and folders
6. **Editor Area**: Write and edit your Markdown
7. **Statistics Bar**: Word count, character count, cursor position

---

## Working with Files

### Creating Files

**Method 1: Context Menu**
1. Right-click in the file tree (on a folder or empty space)
2. Select **"New Markdown File"**
3. Enter the file name (`.md` extension added automatically)
4. Press Enter

**Method 2: Keyboard Shortcut**
- Press `Ctrl/Cmd + N` for a new untitled file

### Creating Folders

1. Right-click in the file tree
2. Select **"New Folder"**
3. Enter the folder name
4. Press Enter

### Opening Files

- **Click** on a file in the file tree
- Or use `Ctrl/Cmd + O` to browse and open

### Renaming Files/Folders

1. Right-click on the file or folder
2. Select **"Rename"**
3. Enter the new name
4. Press Enter

### Deleting Files/Folders

1. Right-click on the file or folder
2. Select **"Delete"**
3. Confirm the deletion

**Warning**: Deletion is permanent and cannot be undone!

### Moving Files

**Drag & Drop**:
1. Click and hold on a file
2. Drag it to the destination folder
3. Release to drop

**Cut & Paste**:
1. Select file(s)
2. Press `Ctrl/Cmd + X` to cut
3. Click on destination folder
4. Press `Ctrl/Cmd + V` to paste

### Multi-Select Operations

**Selecting Multiple Items**:
- `Ctrl/Cmd + Click` - Toggle individual items
- `Shift + Click` - Select range
- `Ctrl/Cmd + A` - Select all (when file tree focused)

**Bulk Operations**:
- Copy multiple files: Select → `Ctrl/Cmd + C`
- Cut multiple files: Select → `Ctrl/Cmd + X`
- Delete multiple files: Select → Right-click → Delete

---

## Editing Markdown

### Edit vs Preview Mode

Loom.md offers two viewing modes:

- **Edit Mode**: See raw Markdown with some inline rendering
- **Preview Mode**: See fully rendered Markdown

Toggle between modes using the **✎** button in the top-right corner.

### Supported Markdown Syntax

#### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

#### Emphasis

```markdown
*italic* or _italic_
**bold** or __bold__
***bold italic*** or ___bold italic___
~~strikethrough~~
```

#### Lists

**Unordered**:
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

**Ordered**:
```markdown
1. First item
2. Second item
3. Third item
```

**Task Lists**:
```markdown
- [ ] Unchecked item
- [x] Checked item
- [ ] Another item
```

#### Links

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title")
```

#### Images

```markdown
![Alt text](path/to/image.png)
![Alt text](https://example.com/image.png "Image title")
```

#### Code

**Inline Code**:
```markdown
Use `code` for inline code.
```

**Code Blocks**:
````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

#### Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.
>
> > Nested blockquotes are supported too.
```

#### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
```

#### Horizontal Rules

```markdown
---
***
___
```

#### Math (LaTeX/KaTeX)

**Inline Math**:
```markdown
The formula $E = mc^2$ is famous.
```

**Block Math**:
```markdown
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

---

## Working with Images

### Pasting Images

1. Copy an image to your clipboard (from browser, screenshot tool, etc.)
2. Position cursor in the editor
3. Press `Ctrl/Cmd + V`
4. The image is automatically saved and inserted

**Image Storage**:
- Default: Same folder as the current file
- Configurable: Set custom location in Settings

### Dragging Images

**From File Explorer**:
1. Drag an image file from your file explorer
2. Drop it into the editor
3. Image markdown is inserted automatically

**From File Tree**:
1. Drag an image file from Loom.md's file tree
2. Drop it into the editor
3. Image markdown is inserted with the correct path

### Configuring Image Storage

1. Click the Settings icon (⚙️)
2. Go to **Custom Settings**
3. Set **Image Save Folder** (e.g., `images`, `./assets/img`)
4. Images will now be saved to this location

**Path Rules**:
- Relative paths start from the current folder
- Use `.` for same folder
- Use `./subfolder` for subfolder

### Viewing Images

- In **Edit Mode**: See the markdown syntax
- In **Preview Mode**: See the rendered image

**Editing Image Markdown**:
- Click on an image in preview mode to edit its markdown

---

## Tab Management

### Opening Tabs

Files open automatically in tabs when you:
- Click a file in the file tree
- Create a new file
- Use `Ctrl/Cmd + O` to open a file

### Switching Tabs

- **Click** on a tab to switch to it
- Files already open won't create duplicate tabs

### Closing Tabs

- Click the **×** button on a tab
- Or press `Ctrl/Cmd + W` to close the active tab
- If the file has unsaved changes, it will auto-save

### Tab Indicators

- **Bold name**: Active tab
- **• (dot)**: Unsaved changes
- **Regular**: Saved file

### Dragging Tabs

You can drag tabs to:
- Reorder them (not yet implemented)
- Create a new window (if saved file)

---

## Customization

### Themes

1. Click the Settings icon (⚙️)
2. Select **Theme**
3. Choose from available themes:
   - **Dark** (default)
   - **Light**
   - Custom imported themes

### Importing Custom Themes

1. Create a theme JSON file
2. Settings → Theme → **Import Theme**
3. Select your theme file
4. The theme will be available in the theme list

### Exporting Themes

1. Settings → Theme
2. Select theme to export
3. Click **Export Theme**
4. Choose save location

### Theme File Format

```json
{
  "name": "My Theme",
  "background": "#1e1e1e",
  "foreground": "#d4d4d4",
  "accent": "#007acc",
  "sidebar_bg": "#252526",
  "editor_bg": "#1e1e1e",
  "line_highlight": "#2a2a2a",
  "selection": "#264f78",
  "comment": "#6a9955",
  "keyword": "#569cd6",
  "string": "#ce9178",
  "function": "#dcdcaa",
  "variable": "#9cdcfe"
}
```

### Settings

Access settings via the Settings icon (⚙️):

- **Appearance**: Theme selection
- **Editor**: Font size, line height (coming soon)
- **Custom Settings**: Image save folder, confirmations
- **About**: Version information

---

## Keyboard Shortcuts

### Global Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New File | `Ctrl + N` | `Cmd + N` |
| Open File | `Ctrl + O` | `Cmd + O` |
| Open Folder | `Ctrl + Shift + O` | `Cmd + Shift + O` |
| Save | `Ctrl + S` | `Cmd + S` |
| Close Tab | `Ctrl + W` | `Cmd + W` |

### File Tree Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Copy | `Ctrl + C` | `Cmd + C` |
| Cut | `Ctrl + X` | `Cmd + X` |
| Paste | `Ctrl + V` | `Cmd + V` |
| Select All | `Ctrl + A` | `Cmd + A` |
| Delete | `Delete` | `Delete` |

### Editor Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Paste | `Ctrl + V` | `Cmd + V` |
| Undo | `Ctrl + Z` | `Cmd + Z` |
| Redo | `Ctrl + Y` | `Cmd + Shift + Z` |
| Bold | `Ctrl + B` | `Cmd + B` |
| Italic | `Ctrl + I` | `Cmd + I` |

---

## Tips & Tricks

### 1. Quick File Navigation

- Use the file tree search (coming soon)
- Recently opened files appear in tab bar
- Create a folder structure that matches your thinking

### 2. Image Management

- Set a dedicated images folder for cleaner organization
- Use descriptive alt text for accessibility
- Keep images under 10MB for best performance

### 3. Markdown Best Practices

- Use headings to structure your document
- Add blank lines around blocks (code, quotes, etc.)
- Use task lists for TODO items
- Reference images with relative paths for portability

### 4. Multi-File Editing

- Use tabs for related files
- Drag files from tree to create quick reference
- Keep frequently accessed files open

### 5. Theme Customization

- Export default themes as a starting point
- Test custom themes before sharing
- Use high contrast for better readability

### 6. Performance Tips

- Close unused tabs
- Avoid extremely large files (>10MB)
- Use folders to organize large projects
- Clear image cache periodically (coming soon)

---

## Troubleshooting

### Files Not Appearing

**Possible Causes**:
- Hidden files (starting with `.`) are filtered out
- Permissions issue
- File watcher not initialized

**Solutions**:
- Ensure files don't start with `.`
- Check folder permissions
- Reopen the folder

### Images Not Displaying

**Possible Causes**:
- Incorrect file path
- Image file moved/deleted
- Unsupported format

**Solutions**:
- Check the image path in markdown
- Ensure image file exists
- Use supported formats (PNG, JPG, GIF, SVG, WebP)

### Slow Performance

**Possible Causes**:
- Very large files
- Many open tabs
- Large images

**Solutions**:
- Close unused tabs
- Split large files into smaller ones
- Compress images
- Restart the application

### Unsaved Changes Lost

**Note**: Loom.md auto-saves when closing tabs.

**If changes were lost**:
- Check if file was saved to expected location
- Check for `.bak` files (coming soon)
- Enable auto-save confirmations in Settings

### Keyboard Shortcuts Not Working

**Possible Causes**:
- Focus is not in the correct area
- OS-level shortcut conflict

**Solutions**:
- Click in the editor or file tree first
- Check for conflicting system shortcuts
- Customize shortcuts (coming soon)

### Theme Not Applying

**Possible Causes**:
- Invalid theme JSON
- Theme file not in correct location

**Solutions**:
- Validate JSON format
- Re-import the theme
- Check console for errors (Dev Tools)

---

## Getting Help

- **Documentation**: Check this guide and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/Royster0/Loom.md/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Royster0/Loom.md/discussions)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## What's Next?

Now that you know the basics, explore:
- [Markdown Syntax Guide](https://www.markdownguide.org/)
- [Custom Theme Creation](ARCHITECTURE.md#configuration-management)
- [Contributing to Loom.md](../CONTRIBUTING.md)

Happy writing! ✍️
