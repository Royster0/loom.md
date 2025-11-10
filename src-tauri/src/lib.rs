mod markdown;
use markdown::{render_markdown_line, LineRenderResult, RenderRequest};
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

// File tree structures
#[derive(Debug, Serialize, Deserialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileEntry>>,
}

// Markdown rendering commands
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

// Read directory contents recursively
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = PathBuf::from(&path);

    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    read_dir_recursive(&dir_path)
}

fn read_dir_recursive(dir_path: &PathBuf) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let dir_entries = fs::read_dir(dir_path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in dir_entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and directories (starting with .)
        if name.starts_with('.') {
            continue;
        }

        let is_dir = path.is_dir();
        let path_str = path.to_string_lossy().to_string();

        let children = if is_dir {
            // Don't recursively read children here - we'll do it on demand in the UI
            Some(Vec::new())
        } else {
            None
        };

        entries.push(FileEntry {
            name,
            path: path_str,
            is_dir,
            children,
        });
    }

    // Sort: directories first, then files, alphabetically within each group
    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

// Read file contents from a path
#[tauri::command]
fn read_file_from_path(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            render_markdown,
            render_markdown_batch,
            read_directory,
            read_file_from_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}