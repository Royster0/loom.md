use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Global application settings (not folder-specific)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalConfig {
    #[serde(default)]
    pub last_opened_folder: Option<String>,
}

impl Default for GlobalConfig {
    fn default() -> Self {
        Self {
            last_opened_folder: None,
        }
    }
}

/// Get the path to the global app data directory
pub fn get_app_data_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}

/// Get the path to the global config file
pub fn get_global_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = get_app_data_dir(app_handle)?;

    // Ensure the directory exists
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    Ok(app_data_dir.join("global_config.json"))
}

/// Load global configuration
pub fn load_global_config(app_handle: &tauri::AppHandle) -> Result<GlobalConfig, String> {
    let config_path = get_global_config_path(app_handle)?;

    if !config_path.exists() {
        return Ok(GlobalConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read global config file: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse global config file: {}", e))
}

/// Save global configuration
pub fn save_global_config(app_handle: &tauri::AppHandle, config: &GlobalConfig) -> Result<(), String> {
    let config_path = get_global_config_path(app_handle)?;

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize global config: {}", e))?;

    fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write global config file: {}", e))
}
