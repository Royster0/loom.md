use serde::{Deserialize, Serialize};

mod markdown;
use markdown::{render_markdown_line, LineRenderResult, RenderRequest};

// Plugin system structures for future extensibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeMetadata {
    pub name: String,
    pub colors: ThemeColors,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeColors {
    pub bg_primary: String,
    pub bg_secondary: String,
    pub text_primary: String,
    pub accent_color: String,
}

// Commands for markdown processing
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

// Placeholder for future plugin system
#[tauri::command]
fn list_plugins() -> Vec<PluginMetadata> {
    // Future implementation: scan plugins directory
    vec![]
}

// Placeholder for future theme system
#[tauri::command]
fn list_themes() -> Vec<ThemeMetadata> {
    // Future implementation: scan themes directory
    vec![]
}

// Markdown rendering command
#[tauri::command]
fn render_markdown(request: RenderRequest) -> LineRenderResult {
    render_markdown_line(request)
}

// Batch rendering for multiple lines (parallelized for performance)
#[tauri::command]
fn render_markdown_batch(requests: Vec<RenderRequest>) -> Vec<LineRenderResult> {
    use rayon::prelude::*;

    // Use parallel iterator for large batches (>50 lines)
    if requests.len() > 50 {
        requests.into_par_iter().map(render_markdown_line).collect()
    } else {
        // For small batches, sequential is faster (no thread overhead)
        requests.into_iter().map(render_markdown_line).collect()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_platform,
            list_plugins,
            list_themes,
            render_markdown,
            render_markdown_batch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}