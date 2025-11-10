/**
 * Theme management module
 */

import { invoke } from "@tauri-apps/api/core";
import { ThemeConfig, AppConfig } from "./types";
import { state } from "./state";

/**
 * Initialize theme system on app startup
 */
export async function initializeTheme(): Promise<void> {
  try {
    // Load available themes
    const themes = await invoke<string[]>("get_available_themes");
    state.availableThemes = themes;

    // Load current theme from config
    const config = await invoke<AppConfig>("load_config");
    state.currentTheme = config.current_theme;

    // Apply the current theme
    await applyTheme(config.current_theme);
  } catch (error) {
    console.error("Failed to initialize theme:", error);
    // Fallback to default dark theme
    state.currentTheme = "dark";
    state.availableThemes = ["dark"];
  }
}

/**
 * Apply a theme by name
 */
export async function applyTheme(themeName: string): Promise<void> {
  try {
    const theme = await invoke<ThemeConfig>("get_theme", { themeName });
    applyThemeVariables(theme);
    state.currentTheme = themeName;
  } catch (error) {
    console.error(`Failed to apply theme '${themeName}':`, error);
    throw error;
  }
}

/**
 * Apply theme variables to CSS custom properties
 */
function applyThemeVariables(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Apply each CSS variable from the theme
  for (const [key, value] of Object.entries(theme.variables)) {
    root.style.setProperty(`--${key}`, value);
  }
}

/**
 * Switch to a different theme and save the preference
 */
export async function switchTheme(themeName: string): Promise<void> {
  try {
    // Apply the theme
    await applyTheme(themeName);

    // Save the preference
    await invoke("set_theme", { themeName });

    console.log(`Switched to theme: ${themeName}`);
  } catch (error) {
    console.error(`Failed to switch theme to '${themeName}':`, error);
    throw error;
  }
}

/**
 * Get a list of all available themes
 */
export async function getAvailableThemes(): Promise<string[]> {
  try {
    return await invoke<string[]>("get_available_themes");
  } catch (error) {
    console.error("Failed to get available themes:", error);
    return [];
  }
}

/**
 * Import a custom theme from a file
 */
export async function importTheme(sourcePath: string): Promise<string> {
  try {
    const themeName = await invoke<string>("import_custom_theme", { sourcePath });

    // Refresh available themes
    const themes = await getAvailableThemes();
    state.availableThemes = themes;

    return themeName;
  } catch (error) {
    console.error("Failed to import theme:", error);
    throw error;
  }
}

/**
 * Export a theme to a file
 */
export async function exportTheme(themeName: string, destPath: string): Promise<void> {
  try {
    await invoke("export_custom_theme", { themeName, destPath });
  } catch (error) {
    console.error("Failed to export theme:", error);
    throw error;
  }
}

/**
 * Get the current theme configuration
 */
export async function getCurrentTheme(): Promise<ThemeConfig> {
  try {
    return await invoke<ThemeConfig>("get_current_theme");
  } catch (error) {
    console.error("Failed to get current theme:", error);
    throw error;
  }
}

/**
 * Get the path to the .slate directory
 */
export async function getSlateDirectory(): Promise<string> {
  try {
    return await invoke<string>("get_slate_directory");
  } catch (error) {
    console.error("Failed to get .slate directory:", error);
    throw error;
  }
}
