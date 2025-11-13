/**
 * Editor event handlers
 * Initializes and coordinates all editor event listeners
 */

import { editor, editModeToggle, editorContainer } from "../core/dom";
import { state } from "../core/state";
import { renderAllLines, getAllLines, renderMarkdownLine } from "./rendering";
import { saveFile } from "../file-operations";
import { closeActiveTab } from "../tabs/tabs";
import { getFirstTextNode } from "./editor-utils";
import { handleEnterKey, handleBackspaceKey, handleDeleteKey, handleTabKey } from "./editor-keys";
import { handleImagePaste, handleImageDrop } from "./image-handling";
import { handleTextPaste } from "./text-paste";
import { handleCursorChange } from "./cursor-management";
import { handleInput } from "./editor-input";
import { toggleSearchModal } from "../search";

// Re-export for other modules
export { handleCursorChange } from "./cursor-management";
export { handleInput } from "./editor-input";

/**
 * Handle paste events - detects if it's image or text and routes accordingly
 */
export async function handlePaste(e: ClipboardEvent) {
  e.preventDefault();

  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  // Check for image data first
  const items = clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Handle image paste
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      if (blob) {
        await handleImagePaste(blob);
        return;
      }
    }
  }

  // Get pasted text (prefer plain text for markdown)
  const pastedText = clipboardData.getData("text/plain");
  if (!pastedText) return;

  await handleTextPaste(pastedText);
}

/**
 * Handle drop events
 */
async function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  editor.classList.remove("drag-over");

  await handleImageDrop(e);
}

/**
 * Initialize all editor event listeners
 */
export function initEditorEvents() {
  // Input event
  editor.addEventListener("input", handleInput);

  // Paste event
  editor.addEventListener("paste", handlePaste);

  // Drag and drop events
  editor.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.classList.add("drag-over");
  });

  editor.addEventListener("dragleave", (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only remove drag-over if we're actually leaving the editor
    const target = e.target as HTMLElement;
    if (target === editor) {
      editor.classList.remove("drag-over");
    }
  });

  editor.addEventListener("drop", handleDrop);

  // Cursor movement
  editor.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Handle image clicks - switch to edit mode to edit markdown
    if (target.tagName === "IMG" && target.classList.contains("markdown-image")) {
      e.preventDefault();
      e.stopPropagation();

      // Find the parent line
      let lineElement = target.parentElement;
      while (lineElement && !lineElement.classList.contains("editor-line")) {
        lineElement = lineElement.parentElement;
      }

      if (!lineElement) return;

      // Get line number
      const lineNum = parseInt(lineElement.getAttribute("data-line") || "0");
      state.currentLine = lineNum;

      // Get the raw text and find the image markdown
      const rawText = lineElement.getAttribute("data-raw") || "";
      const imageMatch = rawText.match(/!\[([^\]]*)\]\(([^\)]+)\)/);

      if (imageMatch) {
        // Render line in edit mode
        const allLines = getAllLines();
        const html = await renderMarkdownLine(rawText, true, lineNum, allLines);
        lineElement.innerHTML = html;
        lineElement.classList.add("editing");

        // Position cursor at the start of the image markdown
        const imageStartPos = imageMatch.index || 0;
        const textNode = getFirstTextNode(lineElement);

        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          const selection = window.getSelection();
          const offset = Math.min(imageStartPos, textNode.textContent?.length || 0);

          range.setStart(textNode, offset);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }

      return;
    }

    // Normal cursor change handling
    await handleCursorChange();
  });

  editor.addEventListener("keyup", handleCursorChange);

  // Focus - put cursor at end if clicking in empty space
  editor.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement;

    if (target === editor || target.classList.contains("editor-container")) {
      e.preventDefault();

      // Ensure there's at least one line
      if (editor.childNodes.length === 0) {
        const newLine = document.createElement("div");
        newLine.className = "editor-line";
        newLine.setAttribute("data-raw", "");
        newLine.setAttribute("data-line", "0");
        newLine.innerHTML = "<br>";
        editor.appendChild(newLine);
      }

      // Focus the last line
      const lastLine = editor.lastChild as HTMLElement;
      if (lastLine) {
        const range = document.createRange();
        const selection = window.getSelection();

        if (lastLine.childNodes.length > 0) {
          const lastNode = lastLine.childNodes[lastLine.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent?.length || 0);
          } else {
            range.setStart(lastLine, lastLine.childNodes.length);
          }
        } else {
          range.setStart(lastLine, 0);
        }

        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);

        state.currentLine = editor.childNodes.length - 1;
        handleCursorChange();
      }
    }
  });

  // Editor container clicks
  editorContainer?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target === editorContainer) {
      editor.focus();
      const lastLine = editor.lastChild as HTMLElement;
      if (lastLine) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(lastLine, lastLine.childNodes.length || 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        state.currentLine = editor.childNodes.length - 1;
        handleCursorChange();
      }
    }
  });

  // Focus and blur
  editor.addEventListener("focus", () => {
    state.editMode = true;
  });

  editor.addEventListener("blur", () => {
    // Save current line's data before blurring
    if (
      state.currentLine !== null &&
      state.currentLine < editor.childNodes.length
    ) {
      const currentLineDiv = editor.childNodes[state.currentLine] as HTMLElement;
      if (currentLineDiv) {
        const currentText = currentLineDiv.textContent || "";
        currentLineDiv.setAttribute("data-raw", currentText);
      }
    }

    state.editMode = false;
    state.currentLine = null;
    renderAllLines(state.currentLine, state.editMode);
  });

  // Keyboard events
  editor.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      await handleEnterKey(e);
    } else if (e.key === "Backspace") {
      await handleBackspaceKey(e);
    } else if (e.key === "Delete") {
      await handleDeleteKey(e);
    } else if (e.key === "Tab") {
      handleTabKey(e);
    }
  });

  // Edit mode toggle
  editModeToggle.addEventListener("click", () => {
    state.editMode = !state.editMode;

    if (state.editMode) {
      editor.focus();
    } else {
      state.currentLine = null;
      renderAllLines(state.currentLine, state.editMode);
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", async (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      await saveFile();
    }

    // Ctrl/Cmd + N to new file
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      document.getElementById("new-file")?.click();
    }

    // Ctrl/Cmd + O to open file
    if ((e.ctrlKey || e.metaKey) && e.key === "o") {
      e.preventDefault();
      document.getElementById("open-file")?.click();
    }

    // Ctrl/Cmd + W to close tab
    if ((e.ctrlKey || e.metaKey) && e.key === "w") {
      e.preventDefault();
      await closeActiveTab();
    }

    // Ctrl/Cmd + F to search
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      toggleSearchModal(false);
    }

    // Ctrl/Cmd + H to search and replace
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      toggleSearchModal(true);
    }
  });

  // Before unload
  window.addEventListener("beforeunload", (e) => {
    if (state.isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
