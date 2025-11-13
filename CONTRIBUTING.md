# Contributing to Loom.md

First off, thank you for considering contributing to Loom.md! It's people like you that make Loom.md such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. Please be respectful, inclusive, and considerate in your interactions.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Rust (latest stable version)
- Git
- A code editor (we recommend VS Code)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Loom.md.git
   cd Loom.md
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   ```bash
   npm run tauri dev
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details**: OS, Loom.md version, etc.

**Use this template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
 - Loom.md Version: [e.g. 0.1.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case**: Why would this be useful?
- **Proposed solution** or implementation ideas
- **Alternative solutions** you've considered
- **Mockups or examples** if applicable

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

### Documentation

Documentation improvements are always welcome! This includes:

- README updates
- Code comments
- User guides
- Architecture documentation
- API documentation

## Development Workflow

### 1. Before You Code

- Check if an issue exists for your change
- If not, create one to discuss the approach
- Get feedback before investing significant time

### 2. While Coding

- Write clean, readable code
- Follow the code style guidelines
- Add comments for complex logic
- Test your changes thoroughly
- Keep commits focused and atomic

### 3. Before Submitting

- Run the application and test all affected features
- Ensure no new warnings or errors
- Update documentation if needed
- Write clear commit messages

## Code Style Guidelines

### TypeScript/JavaScript

- **Use TypeScript** for all new code
- **Formatting**: We use the project's existing style
  - 2 spaces for indentation
  - Semicolons required
  - Single quotes for strings
  - Trailing commas in multi-line objects/arrays

- **Naming Conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
  - Descriptive names (avoid abbreviations)

- **File Organization**:
  - One export per file for utilities
  - Group related functionality
  - Keep files under 300 lines when possible

**Example:**

```typescript
/**
 * Calculate the total word count in markdown content
 * @param content - The markdown content to analyze
 * @returns The total word count
 */
export function calculateWordCount(content: string): number {
  const words = content
    .replace(/[#*_`~\[\]]/g, '') // Remove markdown syntax
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}
```

### Rust

- **Follow Rust conventions**: Use `rustfmt` and `clippy`
- **Naming**:
  - `snake_case` for functions and variables
  - `PascalCase` for types and structs
  - `SCREAMING_SNAKE_CASE` for constants

- **Error Handling**: Use `Result<T, String>` for fallible operations
- **Documentation**: Add doc comments for public APIs

**Example:**

```rust
/// Reads a file and returns its content
///
/// # Arguments
/// * `path` - The path to the file to read
///
/// # Returns
/// The file content as a string or an error message
#[tauri::command]
fn read_file_from_path(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

### CSS

- Use CSS custom properties for theming
- Mobile-first responsive design
- BEM-like naming for components
- Keep selectors specific but not overly nested

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat: add search functionality to file tree

Implement fuzzy search that filters files and folders in the file tree.
Users can now quickly find files by typing part of the filename.

Closes #42
```

```bash
fix: prevent crash when pasting large images

Added validation to check image size before processing.
Images larger than 10MB now show a user-friendly error message.

Fixes #123
```

### Guidelines

- Use imperative mood ("add feature" not "added feature")
- First line should be 50 characters or less
- Reference issues and pull requests when relevant
- Explain *what* and *why*, not *how*

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly**
   - Run the app and test your changes
   - Test edge cases
   - Verify no regressions

3. **Update documentation**
   - Update README if adding features
   - Add/update code comments
   - Update relevant guides

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How you tested these changes

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge
4. Your contribution will be part of the next release!

### After Your PR is Merged

- Delete your feature branch
- Pull the latest changes from main
- Celebrate! 🎉

## Project Structure

Understanding the codebase structure helps you navigate and contribute effectively:

```
Loom.md/
├── src/                          # Frontend source
│   ├── lib/
│   │   ├── editor/              # Editor functionality
│   │   │   ├── editor-events.ts # Event coordination
│   │   │   ├── image-handling.ts # Image paste/drop
│   │   │   ├── text-paste.ts    # Text paste logic
│   │   │   ├── cursor-management.ts # Cursor handling
│   │   │   └── editor-input.ts  # Input processing
│   │   ├── file-tree/           # File tree components
│   │   │   ├── file-tree-render.ts # Tree rendering
│   │   │   ├── file-tree-selection.ts # Multi-select
│   │   │   ├── file-tree-drag-drop.ts # D&D logic
│   │   │   └── file-tree-clipboard.ts # Copy/cut/paste
│   │   ├── formatting/          # Text formatting
│   │   ├── settings/            # Settings system
│   │   ├── tabs/                # Tab management
│   │   ├── ui/                  # UI components
│   │   ├── utils/               # Shared utilities
│   │   │   ├── path-utils.ts    # Path operations
│   │   │   └── cursor-utils.ts  # Cursor utilities
│   │   └── core/                # Core types and state
│   └── main.ts                  # App entry point
├── src-tauri/                   # Rust backend
│   └── src/
│       ├── markdown/            # MD rendering
│       │   ├── mod.rs           # Main parser
│       │   ├── inline_rendering.rs # Inline elements
│       │   └── block_detection.rs # Block detection
│       ├── config.rs            # Config management
│       ├── file_watcher.rs      # FS watcher
│       └── lib.rs               # Tauri commands
└── docs/                        # Documentation
```

### Key Modules

- **Editor**: Handles all editing functionality, split into focused modules
- **File Tree**: File system navigation with multi-select and D&D
- **Rendering**: Markdown to HTML conversion (Rust backend)
- **Settings**: Theme and configuration management
- **Utils**: Shared utilities to reduce code duplication

## Questions?

- **General questions**: Open a [Discussion](https://github.com/Royster0/Loom.md/discussions)
- **Bug reports**: Open an [Issue](https://github.com/Royster0/Loom.md/issues)
- **Need help?**: Check existing issues and discussions first

## Recognition

Contributors are recognized in:
- The contributors list on GitHub
- Release notes for significant contributions
- The README acknowledgments section

---

**Thank you for contributing to Loom.md!** Every contribution, no matter how small, helps make this project better. 🚀
