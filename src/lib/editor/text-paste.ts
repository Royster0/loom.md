/**
 * Text paste handling for the editor
 * Handles pasting text (single-line and multi-line)
 */

import { editor } from "../core/dom";
import { state } from "../core/state";
import { renderMarkdownLine, renderMarkdownBatch, getAllLines, getEditorContent } from "./rendering";
import { updateStatistics } from "../ui/ui";
import { markCurrentTabDirty, updateCurrentTabContent } from "../tabs/tabs";
import { getCurrentLineNumber } from "../ui/ui";
import { getCursorPosition } from "../utils/cursor-utils";

/**
 * Handle paste events - insert pasted text properly into editor structure
 * Supports both text and image pasting
 */
export async function handleTextPaste(pastedText: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const currentLineNum = getCurrentLineNumber();
  const currentLine = editor.childNodes[currentLineNum] as HTMLElement;

  if (!currentLine) return;

  // Find cursor position in current line
  const cursorPos = getCursorPosition(currentLine, range);

  const currentText = currentLine.getAttribute("data-raw") || "";
  const beforeCursor = currentText.substring(0, cursorPos);
  const afterCursor = currentText.substring(cursorPos);

  // Split pasted text by newlines
  const pastedLines = pastedText.split(/\r?\n/);

  if (pastedLines.length === 1) {
    // Single line paste - insert into current line
    const newText = beforeCursor + pastedLines[0] + afterCursor;
    currentLine.setAttribute("data-raw", newText);

    // Re-render the line
    const allLines = getAllLines();
    const html = await renderMarkdownLine(newText, true, currentLineNum, allLines);
    currentLine.innerHTML = html;
    currentLine.classList.add("editing");

    // Position cursor after pasted text
    const newCursorPos = beforeCursor.length + pastedLines[0].length;
    const textNode = currentLine.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const newRange = document.createRange();
      const newSelection = window.getSelection();
      const offset = Math.min(newCursorPos, textNode.textContent?.length || 0);
      newRange.setStart(textNode, offset);
      newRange.collapse(true);
      newSelection?.removeAllRanges();
      newSelection?.addRange(newRange);
    }
  } else {
    // Multi-line paste
    // Update current line with first pasted line
    const firstLineText = beforeCursor + pastedLines[0];
    currentLine.setAttribute("data-raw", firstLineText);
    currentLine.innerHTML = await renderMarkdownLine(firstLineText, false);
    currentLine.classList.remove("editing");

    // Create new lines for remaining pasted lines
    let insertAfter = currentLine;
    for (let i = 1; i < pastedLines.length; i++) {
      const newLine = document.createElement("div");
      newLine.className = "editor-line";

      // Last pasted line gets the text that was after cursor
      const lineText = (i === pastedLines.length - 1)
        ? pastedLines[i] + afterCursor
        : pastedLines[i];

      newLine.setAttribute("data-raw", lineText);
      newLine.setAttribute("data-line", String(currentLineNum + i));
      newLine.innerHTML = lineText || "<br>";

      // Mark the last line as editing
      if (i === pastedLines.length - 1) {
        newLine.classList.add("editing");
      }

      // Insert after previous line
      if (insertAfter.nextSibling) {
        editor.insertBefore(newLine, insertAfter.nextSibling);
      } else {
        editor.appendChild(newLine);
      }
      insertAfter = newLine;
    }

    // Update line numbers for all lines after the inserted ones
    const numNewLines = pastedLines.length - 1;
    for (let i = currentLineNum + numNewLines + 1; i < editor.childNodes.length; i++) {
      const line = editor.childNodes[i] as HTMLElement;
      line.setAttribute("data-line", String(i));
    }

    // Re-render all affected lines
    const allLines = getAllLines();
    const requests: any[] = [];
    for (let i = currentLineNum; i < editor.childNodes.length; i++) {
      const lineDiv = editor.childNodes[i] as HTMLElement;
      const rawText = lineDiv.getAttribute("data-raw") || "";
      const isEditing = i === currentLineNum + numNewLines;
      requests.push({
        line: rawText,
        line_index: i,
        all_lines: allLines,
        is_editing: isEditing,
      });
    }

    const results = await renderMarkdownBatch(requests);
    let resultIndex = 0;
    for (let i = currentLineNum; i < editor.childNodes.length; i++) {
      const lineDiv = editor.childNodes[i] as HTMLElement;
      const isEditing = i === currentLineNum + numNewLines;

      if (results[resultIndex]) {
        lineDiv.innerHTML = results[resultIndex].html;
      }

      if (isEditing) {
        lineDiv.classList.add("editing");
      } else {
        lineDiv.classList.remove("editing");
      }
      resultIndex++;
    }

    // Position cursor at end of last pasted line (before afterCursor text)
    const lastPastedLineNum = currentLineNum + numNewLines;
    const lastPastedLine = editor.childNodes[lastPastedLineNum] as HTMLElement;
    if (lastPastedLine) {
      const lastPastedText = pastedLines[pastedLines.length - 1];
      const textNode = lastPastedLine.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const newRange = document.createRange();
        const newSelection = window.getSelection();
        const offset = Math.min(lastPastedText.length, textNode.textContent?.length || 0);
        newRange.setStart(textNode, offset);
        newRange.collapse(true);
        newSelection?.removeAllRanges();
        newSelection?.addRange(newRange);
      }
      state.currentLine = lastPastedLineNum;
    }
  }

  // Update state
  state.content = getEditorContent();
  updateStatistics(state.content);
  updateCurrentTabContent(state.content);
  markCurrentTabDirty();
}
