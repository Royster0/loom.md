/**
 * File tree clipboard operations
 * Handles copy, cut, and paste operations in the file tree
 */

import { invoke } from "@tauri-apps/api/core";
import { state } from "../core/state";
import { fileTree } from "../core/dom";
import { refreshFileTree } from "./file-tree-core";
import { getSelectedItems } from "./file-tree-selection";
import { getPathSeparator, getFilename } from "../utils/path-utils";

// Clipboard for copy/paste operations
interface ClipboardData {
  paths: string[];
  operation: 'copy' | 'cut';
}
let clipboard: ClipboardData | null = null;

/**
 * Copy selected items to clipboard
 */
export function copySelectedItems() {
  const selectedItems = getSelectedItems();
  if (selectedItems.size === 0) return;

  clipboard = {
    paths: Array.from(selectedItems),
    operation: 'copy'
  };
  console.log("Copied items:", clipboard.paths);

  // Remove cut visual feedback from all items
  document.querySelectorAll(".tree-item.cut")
    .forEach(el => el.classList.remove("cut"));
}

/**
 * Cut selected items to clipboard
 */
export function cutSelectedItems() {
  const selectedItems = getSelectedItems();
  if (selectedItems.size === 0) return;

  clipboard = {
    paths: Array.from(selectedItems),
    operation: 'cut'
  };
  console.log("Cut items:", clipboard.paths);

  // Add visual feedback for cut items
  document.querySelectorAll(".tree-item.cut")
    .forEach(el => el.classList.remove("cut"));

  selectedItems.forEach(path => {
    const item = fileTree.querySelector(`.tree-item[data-path="${CSS.escape(path)}"]`);
    if (item) {
      item.classList.add("cut");
    }
  });
}

/**
 * Paste items from clipboard
 */
export async function pasteItems(targetPath: string | null) {
  if (!clipboard || clipboard.paths.length === 0) {
    console.log("Nothing to paste");
    return;
  }

  // Determine the destination folder
  let destPath = targetPath;
  if (!destPath) {
    destPath = state.currentFolder;
  } else if (targetPath) {
    // Check if target is a file or folder
    const targetItem = fileTree.querySelector(`.tree-item[data-path="${CSS.escape(targetPath)}"]`);
    const isDir = targetItem?.getAttribute("data-is-dir") === "true";
    if (!isDir) {
      // If it's a file, use its parent directory
      const separator = getPathSeparator(targetPath);
      const parts = targetPath.split(separator);
      parts.pop();
      destPath = parts.join(separator) || state.currentFolder;
    }
  }

  if (!destPath) {
    alert("No destination folder");
    return;
  }

  console.log("Pasting to:", destPath);
  console.log("Items:", clipboard.paths);
  console.log("Operation:", clipboard.operation);

  try {
    for (const sourcePath of clipboard.paths) {
      const fileName = getFilename(sourcePath);

      if (!fileName) continue;

      if (clipboard.operation === 'cut') {
        // Move the item
        console.log("Moving:", sourcePath, "to:", destPath);
        const newPath = await invoke<string>("move_path", {
          sourcePath: sourcePath,
          destDirPath: destPath,
        });

        // Update state if we moved the currently open file
        if (state.currentFile === sourcePath) {
          state.currentFile = newPath;
        }
      } else {
        // Copy the item
        console.log("Copying:", sourcePath, "to:", destPath);
        await invoke("copy_path", {
          sourcePath: sourcePath,
          destDirPath: destPath,
        });
      }
    }

    // Clear clipboard and visual feedback after cut operation
    if (clipboard.operation === 'cut') {
      document.querySelectorAll(".tree-item.cut")
        .forEach(el => el.classList.remove("cut"));
      clipboard = null;
    }

    // Refresh the file tree
    await refreshFileTree();
    console.log("Paste operation completed successfully");
  } catch (error) {
    console.error("Failed to paste:", error);
    alert(`Failed to paste: ${error}`);
  }
}

/**
 * Delete multiple selected items
 */
export async function deleteSelectedItems() {
  const selectedItems = getSelectedItems();
  if (selectedItems.size === 0) return;

  const itemCount = selectedItems.size;
  const confirmed = await window.confirm(
    `Delete ${itemCount} item${itemCount > 1 ? 's' : ''}?\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    for (const path of Array.from(selectedItems)) {
      const item = fileTree.querySelector(`.tree-item[data-path="${CSS.escape(path)}"]`);
      const isDir = item?.getAttribute("data-is-dir") === "true";

      if (isDir) {
        await invoke("delete_folder", { path });
      } else {
        await invoke("delete_file", { path });
      }
    }

    // Refresh the file tree
    await refreshFileTree();
    console.log("Successfully deleted selected items");
  } catch (error) {
    console.error("Failed to delete items:", error);
    alert(`Failed to delete items: ${error}`);
  }
}
