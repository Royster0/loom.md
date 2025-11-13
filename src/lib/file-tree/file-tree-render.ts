/**
 * File tree rendering
 * Handles rendering of file tree UI and folder expansion
 */

import { invoke } from "@tauri-apps/api/core";
import type { FileEntry } from "../core/types";
import { fileTree } from "../core/dom";
import { loadFileContent } from "../file-operations";
import { showContextMenu } from "./context-menu";
import { expandedFolders } from "./file-tree-core";
import {
  toggleItemSelection,
  selectItem,
  clearAllSelections,
  selectRange,
  getSelectedItems,
} from "./file-tree-selection";
import { setupDragAndDrop } from "./file-tree-drag-drop";

/**
 * Render file tree from entries
 * @param entries - Array of file entries
 */
export function renderFileTree(entries: FileEntry[]) {
  // Clear file tree but keep the header
  const header = fileTree.querySelector(".file-tree-header");
  fileTree.innerHTML = "";

  // Re-add the header if it existed
  if (header) {
    fileTree.appendChild(header);
  }

  entries.forEach((entry) => {
    const treeItem = createTreeItem(entry);
    fileTree.appendChild(treeItem);
  });
}

/**
 * Create a tree item element
 * @param entry - File entry to create item for
 * @param level - Nesting level for indentation
 * @returns HTMLElement representing the tree item
 */
export function createTreeItem(entry: FileEntry, level: number = 0): HTMLElement {
  const container = document.createElement("div");

  const item = document.createElement("div");
  item.className = "tree-item";
  item.style.paddingLeft = `${level * 16 + 8}px`;
  item.setAttribute("data-path", entry.path);
  item.setAttribute("data-is-dir", entry.is_dir.toString());

  // Make item draggable
  item.setAttribute("draggable", "true");

  // Arrow for folders
  if (entry.is_dir) {
    const arrow = document.createElement("span");
    arrow.className = "tree-item-arrow";
    arrow.setAttribute("draggable", "false"); // Prevent child from being draggable
    arrow.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 4 10 8 6 12"></polyline>
      </svg>
    `;
    item.appendChild(arrow);
  } else {
    // Empty space for files to align with folders
    const spacer = document.createElement("span");
    spacer.className = "tree-item-arrow";
    spacer.setAttribute("draggable", "false");
    item.appendChild(spacer);
  }

  // Icon
  const icon = document.createElement("span");
  icon.className = "tree-item-icon";
  icon.setAttribute("draggable", "false"); // Prevent child from being draggable
  if (entry.is_dir) {
    icon.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3h4l1 2h7v9H2z"></path>
      </svg>
    `;
  } else {
    icon.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 1h7l3 3v10H3z"></path>
        <polyline points="10 1 10 4 13 4"></polyline>
      </svg>
    `;
  }
  item.appendChild(icon);

  // Name
  const name = document.createElement("span");
  name.className = "tree-item-name";
  name.setAttribute("draggable", "false"); // Prevent child from being draggable
  name.textContent = entry.name;
  item.appendChild(name);

  container.appendChild(item);

  // Right-click handler for context menu
  item.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedItems = getSelectedItems();

    // If right-clicking on a non-selected item, select it first
    if (!selectedItems.has(entry.path)) {
      clearAllSelections();
      selectItem(entry.path, item);
    }

    showContextMenu(e.clientX, e.clientY, entry.path, entry.is_dir, selectedItems.size);
  });

  // Children container for folders
  if (entry.is_dir) {
    const childrenContainer = document.createElement("div");
    childrenContainer.className = "tree-children collapsed";
    container.appendChild(childrenContainer);

    // Click handler for folders
    item.addEventListener("click", async (e) => {
      // Drag state is managed by file-tree-drag-drop
      const isDragging = item.classList.contains("dragging");
      if (isDragging) return;

      e.stopPropagation();

      // Handle multi-select for folders
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd+Click: Toggle selection
        toggleItemSelection(entry.path, item);
      } else if (e.shiftKey) {
        // Shift+Click: Range selection
        selectRange(entry.path);
      } else {
        // Normal click: Single selection and toggle folder
        clearAllSelections();
        selectItem(entry.path, item);
        await toggleFolder(item, childrenContainer, entry, level);
      }
    });
  } else {
    // Click handler for files
    item.addEventListener("click", async (e) => {
      // Drag state is managed by file-tree-drag-drop
      const isDragging = item.classList.contains("dragging");
      if (isDragging) return;

      e.stopPropagation();

      // Handle multi-select
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd+Click: Toggle selection
        toggleItemSelection(entry.path, item);
      } else if (e.shiftKey) {
        // Shift+Click: Range selection
        selectRange(entry.path);
      } else {
        // Normal click: Single selection
        clearAllSelections();
        selectItem(entry.path, item);
        await loadFileContent(entry.path);
      }
    });
  }

  // Drag and drop handlers
  setupDragAndDrop(item, entry);

  return container;
}

/**
 * Toggle folder expand/collapse
 * @param item - The folder item element
 * @param childrenContainer - Container for folder children
 * @param entry - File entry for the folder
 * @param level - Nesting level
 */
async function toggleFolder(
  item: HTMLElement,
  childrenContainer: HTMLElement,
  entry: FileEntry,
  level: number
) {
  const arrow = item.querySelector(".tree-item-arrow");
  const isCollapsed = childrenContainer.classList.contains("collapsed");

  if (isCollapsed) {
    // Expand folder
    childrenContainer.classList.remove("collapsed");
    arrow?.classList.add("expanded");
    expandedFolders.add(entry.path);

    // Load children if not already loaded
    if (childrenContainer.children.length === 0) {
      try {
        const children = await invoke<FileEntry[]>("read_directory", {
          path: entry.path,
        });
        children.forEach((childEntry: FileEntry) => {
          const childItem = createTreeItem(childEntry, level + 1);
          childrenContainer.appendChild(childItem);
        });
      } catch (error) {
        console.error("Error loading folder contents:", error);
      }
    }
  } else {
    // Collapse folder
    childrenContainer.classList.add("collapsed");
    arrow?.classList.remove("expanded");
    expandedFolders.delete(entry.path);
  }
}
