/**
 * Multi-file search functionality
 * Handles searching across all files in the currently open folder
 */

import { invoke } from '@tauri-apps/api/core';
import type { FileSearchResult, SearchOptions } from './search-state';
import { setMultiFileResults } from './search-state';
import { state } from '../core/state';

/**
 * Search across all files in the current folder
 */
export async function searchInFolder(query: string, options: SearchOptions): Promise<FileSearchResult[]> {
  if (!query || !state.currentFolder) {
    setMultiFileResults([]);
    return [];
  }

  try {
    const results = await invoke<FileSearchResult[]>('search_in_directory', {
      query,
      dirPath: state.currentFolder,
      options,
    });

    setMultiFileResults(results);
    return results;
  } catch (error) {
    console.error('Multi-file search failed:', error);
    setMultiFileResults([]);
    return [];
  }
}

/**
 * Get a summary of search results
 */
export function getSearchResultsSummary(results: FileSearchResult[]): string {
  if (results.length === 0) {
    return 'No results found';
  }

  const totalMatches = results.reduce((sum, result) => sum + result.matches.length, 0);
  const fileCount = results.length;

  return `Found ${totalMatches} match${totalMatches === 1 ? '' : 'es'} in ${fileCount} file${fileCount === 1 ? '' : 's'}`;
}
