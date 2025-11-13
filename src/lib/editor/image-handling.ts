/**
 * Image handling for the editor
 * Handles image paste, drop, and insertion
 */

import { editor } from "../core/dom";
import { state } from "../core/state";
import { invoke } from "@tauri-apps/api/core";
import { getSettings } from "../settings/settings-manager";
import { renderMarkdownLine, getAllLines, getEditorContent } from "./rendering";
import { updateStatistics } from "../ui/ui";
import { markCurrentTabDirty, updateCurrentTabContent } from "../tabs/tabs";
import { getCurrentLineNumber } from "../ui/ui";
import { getFirstTextNode } from "./editor-utils";
import { isImagePath } from "../utils/path-utils";
import { getCursorPosition } from "../utils/cursor-utils";

/**
 * Convert a blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const result = reader.result as string;
        if (!result || !result.includes(",")) {
          reject(new Error("Invalid data URL format"));
          return;
        }
        const base64 = result.split(",")[1]; // Remove data:image/png;base64, prefix
        if (!base64) {
          reject(new Error("Failed to extract base64 data"));
          return;
        }
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Insert image markdown at cursor position
 * @param imagePath - Path to the image file
 * @param altText - Alt text for the image
 */
export async function insertImageAtCursor(imagePath: string, altText: string = "image") {
  // Get current selection and cursor position
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

  // Insert markdown image syntax with absolute path
  const imageMarkdown = `![${altText}](${imagePath})`;
  const newText = beforeCursor + imageMarkdown + afterCursor;
  currentLine.setAttribute("data-raw", newText);

  // Re-render the line
  const allLines = getAllLines();
  const html = await renderMarkdownLine(newText, true, currentLineNum, allLines);
  currentLine.innerHTML = html;
  currentLine.classList.add("editing");

  // Position cursor after inserted image markdown
  const newCursorPos = beforeCursor.length + imageMarkdown.length;
  const textNode = getFirstTextNode(currentLine);
  if (textNode) {
    const newRange = document.createRange();
    const newSelection = window.getSelection();
    const offset = Math.min(newCursorPos, textNode.textContent?.length || 0);
    newRange.setStart(textNode, offset);
    newRange.collapse(true);
    newSelection?.removeAllRanges();
    newSelection?.addRange(newRange);
  }

  // Update state
  state.content = getEditorContent();
  updateStatistics(state.content);
  updateCurrentTabContent(state.content);
  markCurrentTabDirty();
}

/**
 * Handle image paste from clipboard
 */
export async function handleImagePaste(blob: Blob) {
  try {
    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error("Invalid or empty image data");
    }

    // Check if blob is too large (e.g., > 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error("Image is too large (max 10MB)");
    }

    // Convert blob to base64
    const base64Data = await blobToBase64(blob);

    // Get settings to determine save directory
    const settings = await getSettings();
    let imageSaveFolder = settings.custom_settings?.imageSaveFolder || ".";

    // Resolve save directory relative to current folder
    let resolvedSaveDir = state.currentFolder || ".";
    if (imageSaveFolder && imageSaveFolder !== ".") {
      // Remove leading ./ if present
      imageSaveFolder = imageSaveFolder.replace(/^\.\//, "");

      // Build absolute path
      if (state.currentFolder) {
        resolvedSaveDir = `${state.currentFolder}/${imageSaveFolder}`;
      } else {
        resolvedSaveDir = imageSaveFolder;
      }
    }

    // Save image via Rust backend
    const imagePath = await invoke<string>("save_image_from_clipboard", {
      base64Data,
      saveDir: resolvedSaveDir,
      filenamePrefix: "pasted",
    });

    // Insert image at cursor
    await insertImageAtCursor(imagePath, "image");

    console.log(`Image pasted and saved to: ${imagePath}`);
  } catch (error) {
    console.error("Failed to paste image:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    alert(`Failed to paste image: ${errorMsg}`);
  }
}

/**
 * Handle drop events - insert dropped images into editor
 */
export async function handleImageDrop(e: DragEvent) {
  try {
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    // Check for files (external drop, e.g., from File Explorer)
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      for (const file of Array.from(dataTransfer.files)) {
        // Only handle image files
        if (file.type.startsWith("image/")) {
          console.log("Dropped external image file:", file.name);

          // Read file as blob and handle like paste
          await handleImagePaste(file);
        }
      }
      return;
    }

    // Check for file path (from file tree)
    const filePath = dataTransfer.getData("text/plain");
    if (filePath && isImagePath(filePath)) {
      console.log("Dropped image from file tree:", filePath);

      // Get filename for alt text
      const fileName = filePath.split(/[/\\]/).pop() || "image";

      // Insert image at drop position
      await insertImageAtCursor(filePath, fileName);
    }
  } catch (error) {
    console.error("Failed to handle drop:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    alert(`Failed to insert dropped image: ${errorMsg}`);
  }
}
