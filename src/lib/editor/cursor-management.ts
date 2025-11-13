/**
 * Cursor management for the editor
 * Handles cursor position changes and line switching
 */

import { editor } from "../core/dom";
import { state } from "../core/state";
import { renderMarkdownLine, getAllLines } from "./rendering";
import { updateCursorPosition } from "../ui/ui";
import { getFirstTextNode, isLineInsideBlock } from "./editor-utils";
import { saveCursorPosition } from "../utils/cursor-utils";

/**
 * Handle cursor changes (moving between lines)
 */
export async function handleCursorChange() {
  // If there's an active selection, don't interfere with it
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    updateCursorPosition();
    return;
  }

  // Get current line number from cursor position
  let lineNum = 0;
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    // Find the parent editor-line element
    while (node && node !== editor) {
      if (node instanceof HTMLElement && node.classList.contains("editor-line")) {
        const lineAttr = node.getAttribute("data-line");
        lineNum = lineAttr ? parseInt(lineAttr) : 0;
        break;
      }
      node = node.parentNode as Node;
    }
  }

  if (lineNum !== state.currentLine) {
    const oldLine = state.currentLine;
    state.currentLine = lineNum;

    // Get all lines for code block detection
    const allLines = getAllLines();

    // Re-render the old line if it exists
    if (oldLine !== null && oldLine < editor.childNodes.length) {
      const oldLineDiv = editor.childNodes[oldLine] as HTMLElement;
      if (oldLineDiv) {
        // Only update data-raw if the line was actually being edited AND it's safe to do so
        if (oldLineDiv.classList.contains("editing")) {
          const innerHTML = oldLineDiv.innerHTML;
          const hasSpecialClass =
            innerHTML.includes("code-block-line-editing") ||
            innerHTML.includes("math-block-line-editing") ||
            innerHTML.includes("math-block-line") ||
            innerHTML.includes('class="math-block-start"') ||
            innerHTML.includes('class="math-block-end"') ||
            innerHTML.includes('class="code-block-start"') ||
            innerHTML.includes('class="code-block-end"');

          const insideBlock = isLineInsideBlock(oldLine, allLines);
          const isSpecialBlock = hasSpecialClass || insideBlock;

          if (!isSpecialBlock) {
            const currentText = oldLineDiv.textContent || "";
            oldLineDiv.setAttribute("data-raw", currentText);
            allLines[oldLine] = currentText;
          }
        }

        const rawText = oldLineDiv.getAttribute("data-raw") || "";
        const html = await renderMarkdownLine(rawText, false, oldLine, allLines);
        oldLineDiv.innerHTML = html;
        oldLineDiv.classList.remove("editing");
      }
    }

    // Update current line to show raw
    const currentLineDiv = editor.childNodes[lineNum] as HTMLElement;
    if (currentLineDiv) {
      const rawText = currentLineDiv.getAttribute("data-raw") || "";

      // Save cursor position before modifying innerHTML
      const cursorOffset = saveCursorPosition(currentLineDiv);

      // Update the line to show raw markdown
      const html = await renderMarkdownLine(rawText, true, lineNum, allLines);
      currentLineDiv.innerHTML = html;
      currentLineDiv.classList.add("editing");

      // Use requestAnimationFrame to ensure DOM layout is complete
      requestAnimationFrame(() => {
        try {
          const textNode = getFirstTextNode(currentLineDiv);
          if (
            textNode &&
            textNode.nodeType === Node.TEXT_NODE &&
            textNode.textContent
          ) {
            const newRange = document.createRange();
            const newSelection = window.getSelection();
            const offset = Math.min(cursorOffset, textNode.textContent.length);
            newRange.setStart(textNode, offset);
            newRange.collapse(true);
            newSelection?.removeAllRanges();
            newSelection?.addRange(newRange);
          } else {
            editor.focus();
          }
        } catch (e) {
          console.error("Cursor restoration failed:", e);
          editor.focus();
        }
      });
    }
  }

  updateCursorPosition();
}
