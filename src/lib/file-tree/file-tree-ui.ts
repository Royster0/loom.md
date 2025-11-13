/**
 * File tree UI module
 * Coordinates file tree rendering and UI interactions
 */

import { invoke } from "@tauri-apps/api/core";
import { fileTree } from "../core/dom";
import { showContextMenu, initContextMenu } from "./context-menu";
import { refreshAndRevealFile, refreshFileTree } from "./file-tree-core";
import { initSidebarResize } from "./sidebar";
import { state } from "../core/state";
import { getSelectedItems, selectAllItems, clearAllSelections } from "./file-tree-selection";
import { copySelectedItems, cutSelectedItems, pasteItems, deleteSelectedItems } from "./file-tree-clipboard";
import { getDraggedItems } from "./file-tree-drag-drop";

// Re-export for other modules
export { renderFileTree, createTreeItem } from "./file-tree-render";

/**
 * Context menu handler for empty space in file tree
 */
function handleFileTreeContextMenu(e: MouseEvent) {
  // Only trigger if clicking directly on fileTree (not on tree items)
  if (e.target === fileTree) {
    e.preventDefault();
    const selectedItems = getSelectedItems();
    showContextMenu(e.clientX, e.clientY, null, false, selectedItems.size);
  }
}

/**
 * Initialize file tree functionality
 */
export function initFileTree() {
  initContextMenu();
  initSidebarResize();

  // Add event listeners for context menu actions
  document.addEventListener('file-tree-copy', () => {
    copySelectedItems();
  });

  document.addEventListener('file-tree-cut', () => {
    cutSelectedItems();
  });

  document.addEventListener('file-tree-paste', async (e: Event) => {
    const customEvent = e as CustomEvent;
    const targetPath = customEvent.detail?.targetPath || null;
    await pasteItems(targetPath);
  });

  document.addEventListener('file-tree-delete', async () => {
    await deleteSelectedItems();
  });

  // Add keyboard shortcuts for copy/paste
  document.addEventListener("keydown", async (e) => {
    // Only handle shortcuts when file tree is focused or selected items exist
    const selectedItems = getSelectedItems();
    const isFileTreeFocused = fileTree.contains(document.activeElement) || selectedItems.size > 0;

    if (!isFileTreeFocused) return;

    // Copy: Ctrl+C or Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      copySelectedItems();
    }
    // Cut: Ctrl+X or Cmd+X
    else if ((e.ctrlKey || e.metaKey) && e.key === 'x' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      cutSelectedItems();
    }
    // Paste: Ctrl+V or Cmd+V
    else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      // Paste to the first selected item or current folder
      const targetPath = selectedItems.size > 0 ?
                         Array.from(selectedItems)[0] :
                         state.currentFolder;
      await pasteItems(targetPath);
    }
    // Select All: Ctrl+A or Cmd+A (when focused in file tree)
    else if ((e.ctrlKey || e.metaKey) && e.key === 'a' &&
             fileTree.contains(document.activeElement)) {
      e.preventDefault();
      selectAllItems();
    }
  });

  // Add context menu handler for empty space (only once during init)
  fileTree.addEventListener("contextmenu", handleFileTreeContextMenu);

  // Allow dropping into empty space to move items to root folder
  fileTree.addEventListener("dragover", (e: DragEvent) => {
    // Only handle if dragging over the fileTree itself (empty space), not child elements
    if (e.target === fileTree) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      fileTree.classList.add("drag-over-root");
    }
  });

  fileTree.addEventListener("dragleave", (e: DragEvent) => {
    // Only process if leaving the fileTree itself
    if (e.target === fileTree) {
      fileTree.classList.remove("drag-over-root");
    }
  });

  fileTree.addEventListener("drop", async (e: DragEvent) => {
    // Only handle if dropping on the fileTree itself (empty space)
    if (e.target === fileTree) {
      e.preventDefault();
      fileTree.classList.remove("drag-over-root");

      const draggedItems = getDraggedItems();
      if (!state.currentFolder || draggedItems.length === 0) return;

      try {
        console.log(`Moving ${draggedItems.length} item(s) to root:`, state.currentFolder);

        let lastMovedPath: string | null = null;

        // Move all dragged items to the root directory
        for (const sourcePath of draggedItems) {
          const newPath = await invoke<string>("move_path", {
            sourcePath: sourcePath,
            destDirPath: state.currentFolder,
          });

          lastMovedPath = newPath;

          // Update state if we moved the currently open file
          if (state.currentFile === sourcePath) {
            state.currentFile = newPath;
          }
        }

        // Clear selections after move
        clearAllSelections();

        // Refresh and reveal the last moved item
        if (lastMovedPath) {
          await refreshAndRevealFile(lastMovedPath);
        } else {
          await refreshFileTree();
        }
      } catch (error) {
        console.error("Failed to move to root:", error);
        alert(`Failed to move: ${error}`);
      }
    }
  });
}
