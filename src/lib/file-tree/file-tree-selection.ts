/**
 * File tree selection management
 * Handles single and multi-select in the file tree
 */

import { fileTree } from "../core/dom";

// Track selected items for multi-select
const selectedItems = new Set<string>();
let lastSelectedPath: string | null = null;

/**
 * Get the current set of selected items
 */
export function getSelectedItems(): Set<string> {
  return selectedItems;
}

/**
 * Get the last selected path
 */
export function getLastSelectedPath(): string | null {
  return lastSelectedPath;
}

/**
 * Select a single item
 */
export function selectItem(path: string, element: HTMLElement) {
  selectedItems.clear();
  selectedItems.add(path);
  lastSelectedPath = path;
  element.classList.add("selected");
}

/**
 * Toggle item selection
 */
export function toggleItemSelection(path: string, element: HTMLElement) {
  if (selectedItems.has(path)) {
    selectedItems.delete(path);
    element.classList.remove("selected");
    if (lastSelectedPath === path) {
      lastSelectedPath = selectedItems.size > 0 ? Array.from(selectedItems)[0] : null;
    }
  } else {
    selectedItems.add(path);
    lastSelectedPath = path;
    element.classList.add("selected");
  }
}

/**
 * Clear all selections
 */
export function clearAllSelections() {
  selectedItems.clear();
  document.querySelectorAll(".tree-item.selected")
    .forEach((el) => el.classList.remove("selected"));
}

/**
 * Select a range of items between last selected and target path
 */
export function selectRange(endPath: string) {
  if (!lastSelectedPath) {
    // If no previous selection, just select the end path
    const item = fileTree.querySelector(`.tree-item[data-path="${CSS.escape(endPath)}"]`) as HTMLElement;
    if (item) {
      clearAllSelections();
      selectedItems.add(endPath);
      item.classList.add("selected");
      lastSelectedPath = endPath;
    }
    return;
  }

  const allItems = Array.from(fileTree.querySelectorAll(".tree-item")) as HTMLElement[];
  const startIndex = allItems.findIndex(item => item.getAttribute("data-path") === lastSelectedPath);
  const endIndex = allItems.findIndex(item => item.getAttribute("data-path") === endPath);

  if (startIndex === -1 || endIndex === -1) return;

  const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

  clearAllSelections();
  for (let i = from; i <= to; i++) {
    const item = allItems[i];
    const path = item.getAttribute("data-path");
    if (path) {
      selectedItems.add(path);
      item.classList.add("selected");
    }
  }
  lastSelectedPath = endPath;
}

/**
 * Select all visible items in the file tree
 */
export function selectAllItems() {
  const allItems = fileTree.querySelectorAll(".tree-item") as NodeListOf<HTMLElement>;
  clearAllSelections();
  allItems.forEach(item => {
    const path = item.getAttribute("data-path");
    if (path) {
      selectedItems.add(path);
      item.classList.add("selected");
    }
  });
  if (selectedItems.size > 0) {
    lastSelectedPath = Array.from(selectedItems)[selectedItems.size - 1];
  }
}
