/**
 * Markdown Editor - Main Entry Point
 *
 * This is a modular markdown editor built with TypeScript, Tauri, and Rust.
 * The application provides live markdown preview with LaTeX support.
 */

import "./lib/types";
import { state } from "./lib/state";
import { updateStatistics, updateCursorPosition } from "./lib/ui";
import { initEditorEvents } from "./lib/editor";
import { initWindowControls } from "./lib/window-controls";
import { initializeTheme } from "./lib/theme";
import { initializeSettings } from "./lib/settings";
import { initFileTree } from "./lib/file-tree";
import { initWelcomeScreen } from "./lib/welcome-screen";
import { initTabs } from "./lib/tabs";

/**
 * Initialize the application
 */
async function initialize() {
  // Initialize theme system first (loads saved theme preference)
  await initializeTheme();

  // Initialize settings system
  await initializeSettings();

  // Initialize tab system (this will create the initial tab with current state)
  initTabs();

  // Initialize event handlers
  initEditorEvents();
  initWindowControls();
  initFileTree();
  initWelcomeScreen();

  // Initialize UI
  updateStatistics(state.content);
  updateCursorPosition();

  console.log("Markdown Editor initialized successfully");
}

// Start the application
initialize().catch((error) => {
  console.error("Failed to initialize application:", error);
});
