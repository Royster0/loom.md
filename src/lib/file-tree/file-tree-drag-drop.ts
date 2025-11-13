/**
 * File tree drag and drop
 * Handles drag and drop operations in the file tree
 */

import { invoke } from "@tauri-apps/api/core";
import type { FileEntry } from "../core/types";
import { fileTree } from "../core/dom";
import { state } from "../core/state";
import { refreshAndRevealFile, refreshFileTree } from "./file-tree-core";
import { selectItem, clearAllSelections, getSelectedItems } from "./file-tree-selection";
import { getPathSeparator } from "../utils/path-utils";

// Store the currently dragged item(s)
let draggedItemPath: string | null = null;
let draggedItems: string[] = [];

/**
 * Setup drag and drop handlers for a tree item
 * @param item - The tree item element
 * @param entry - File entry for the item
 */
export function setupDragAndDrop(item: HTMLElement, entry: FileEntry) {
  // Drag start handler
  item.addEventListener("dragstart", (e: DragEvent) => {
    item.classList.add("dragging");
    draggedItemPath = entry.path;

    const selectedItems = getSelectedItems();

    // If this item is selected, drag all selected items
    // Otherwise, just drag this single item
    if (selectedItems.has(entry.path)) {
      draggedItems = Array.from(selectedItems);
    } else {
      draggedItems = [entry.path];
      // Select this item since we're dragging it
      clearAllSelections();
      selectItem(entry.path, item);
    }

    // Set drag data - MUST set at least one data item for drag to work
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", entry.path);

      // Create custom drag image showing count if multiple items
      const dragImage = item.cloneNode(true) as HTMLElement;
      dragImage.style.position = "absolute";
      dragImage.style.top = "-9999px";

      // Add badge for multiple items
      if (draggedItems.length > 1) {
        const badge = document.createElement("span");
        badge.style.cssText = "background: var(--accent-color); color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 8px;";
        badge.textContent = String(draggedItems.length);
        dragImage.appendChild(badge);
      }

      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      // Clean up the drag image after a short delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    }
  });

  // Drag end handler
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    draggedItemPath = null;
    draggedItems = [];

    // Remove all drag-over classes
    document.querySelectorAll(".tree-item.drag-over")
      .forEach(el => el.classList.remove("drag-over"));
    fileTree.classList.remove("drag-over-root");
  });

  // Drag over handler - applies to all items but only folders are valid drop targets
  item.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only folders can be drop targets
    if (!entry.is_dir) {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "none";
      }
      return;
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    // Don't allow dropping into itself or if no item is being dragged
    if (!draggedItemPath || draggedItemPath === entry.path) {
      return;
    }

    // Check if we're not trying to move a parent folder into its child
    const separator = getPathSeparator(entry.path);
    if (entry.path.startsWith(draggedItemPath + separator)) {
      return;
    }

    item.classList.add("drag-over");
  });

  // Drag leave handler - applies to all items
  item.addEventListener("dragleave", (e: DragEvent) => {
    // Only process if this is a folder
    if (!entry.is_dir) {
      return;
    }

    // Only remove drag-over if we're actually leaving the item, not just entering a child
    const rect = item.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      item.classList.remove("drag-over");
    }
  });

  // Drop handler - only folders handle drops
  if (entry.is_dir) {
    item.addEventListener("drop", async (e: DragEvent) => {
      console.log("📦 Drop on:", entry.name);
      e.preventDefault();
      e.stopPropagation();
      item.classList.remove("drag-over");

      if (!draggedItemPath || draggedItems.length === 0) return;

      const separator = getPathSeparator(entry.path);

      // Check if any item is being dropped into itself or its own subfolder
      for (const itemPath of draggedItems) {
        // Don't allow dropping into itself
        if (itemPath === entry.path) {
          alert("Cannot move an item into itself");
          return;
        }

        // Don't allow moving a parent folder into its child
        if (entry.path.startsWith(itemPath + separator)) {
          alert("Cannot move a folder into its own subfolder");
          return;
        }
      }

      try {
        console.log(`Moving ${draggedItems.length} item(s) to:`, entry.path);

        let lastMovedPath: string | null = null;

        // Move all dragged items
        for (const sourcePath of draggedItems) {
          console.log("Moving:", sourcePath, "to:", entry.path);
          const newPath = await invoke<string>("move_path", {
            sourcePath: sourcePath,
            destDirPath: entry.path,
          });

          console.log("Moved successfully to:", newPath);
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
        console.error("Failed to move:", error);
        alert(`Failed to move: ${error}`);
      }
    });
  }
}

/**
 * Get currently dragged items
 */
export function getDraggedItems(): string[] {
  return draggedItems;
}
