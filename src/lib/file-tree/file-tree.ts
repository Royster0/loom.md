/**
 * File tree module - Main orchestrator
 * Coordinates file tree core logic, UI, and sidebar
 */

// Re-export for backward compatibility
export { openFolder, loadFileTree, refreshFileTree, refreshAndRevealFile, updateExplorerHeader, expandAndRevealPath, findTreeItemByPath, selectTreeItem, expandedFolders, saveLastOpenedFolder, getLastOpenedFolder, startWatchingFolder } from "./file-tree-core";
export { renderFileTree, createTreeItem, initFileTree } from "./file-tree-ui";
export { toggleSidebar, initSidebarResize } from "./sidebar";
