/**
 * Editor input handling
 * Handles text input and real-time rendering
 */

import { editor } from "../core/dom";
import { state } from "../core/state";
import { renderMarkdownLine, getAllLines, getEditorContent } from "./rendering";
import { updateStatistics } from "../ui/ui";
import { markCurrentTabDirty, updateCurrentTabContent } from "../tabs/tabs";
import { getCurrentLineNumber } from "../ui/ui";
import { findTextNodeAtOffset, saveCursorPosition } from "../utils/cursor-utils";

/**
 * Handle input events in the editor
 */
export async function handleInput() {
  const currentLineNum = getCurrentLineNumber();
  const lineDiv = editor.childNodes[currentLineNum] as HTMLElement;

  if (lineDiv) {
    const rawText = lineDiv.textContent || "";
    lineDiv.setAttribute("data-raw", rawText);

    // Save cursor position before re-rendering
    const cursorOffset = saveCursorPosition(lineDiv);

    // Re-render the line with editing mode
    const allLines = getAllLines();
    const html = await renderMarkdownLine(
      rawText,
      true,
      currentLineNum,
      allLines
    );
    lineDiv.innerHTML = html;

    // Restore cursor position
    try {
      const textNode = lineDiv.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const newRange = document.createRange();
        const newSelection = window.getSelection();
        const offset = Math.min(
          cursorOffset,
          textNode.textContent?.length || 0
        );
        newRange.setStart(textNode, offset);
        newRange.collapse(true);
        newSelection?.removeAllRanges();
        newSelection?.addRange(newRange);
      } else if (lineDiv.childNodes.length > 0) {
        // Handle complex nodes
        const { node: targetNode, offset: targetOffset } = findTextNodeAtOffset(lineDiv, cursorOffset);

        if (targetNode) {
          const newRange = document.createRange();
          const newSelection = window.getSelection();
          newRange.setStart(targetNode, targetOffset);
          newRange.collapse(true);
          newSelection?.removeAllRanges();
          newSelection?.addRange(newRange);
        }
      }
    } catch (e) {
      console.warn("Failed to restore cursor position:", e);
    }
  }

  state.content = getEditorContent();
  updateStatistics(state.content);
  updateCurrentTabContent(state.content);
  markCurrentTabDirty();
}
