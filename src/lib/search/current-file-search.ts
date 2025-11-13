/**
 * Current file search functionality
 * Handles searching and replacing within the currently open file
 */

import { invoke } from '@tauri-apps/api/core';
import type { SearchMatch, SearchOptions } from './search-state';
import { getSearchState, setCurrentFileMatches, nextMatch, previousMatch } from './search-state';
import { highlightMatches, scrollToMatch, clearHighlights } from './search-highlighting';
import { state } from '../core/state';
import { editor } from '../core/dom';

/**
 * Get the rendered text content from the editor (line by line)
 */
function getRenderedContent(): string {
  if (!editor) return '';

  const lines: string[] = [];
  const lineElements = editor.querySelectorAll('.editor-line');

  lineElements.forEach((lineElement) => {
    lines.push(lineElement.textContent || '');
  });

  return lines.join('\n');
}

/**
 * Search in the current file content (rendered text)
 */
export async function searchInCurrentFile(query: string, options: SearchOptions): Promise<void> {
  if (!query || !editor) {
    setCurrentFileMatches([]);
    clearHighlights();
    return;
  }

  try {
    // Get the rendered text content from the editor
    const renderedContent = getRenderedContent();

    // Search in the rendered content
    const matches = await invoke<SearchMatch[]>('search_in_content', {
      query,
      content: renderedContent,
      options,
    });

    setCurrentFileMatches(matches);
    highlightMatches(matches);

    // Scroll to first match if any (don't focus to avoid cursor issues)
    if (matches.length > 0) {
      scrollToMatch(matches[0], false);
    }
  } catch (error) {
    console.error('Search failed:', error);
    setCurrentFileMatches([]);
    clearHighlights();
  }
}

/**
 * Navigate to the next match in the current file
 */
export function goToNextMatch(): void {
  const searchState = getSearchState();
  console.log('goToNextMatch called, matches:', searchState.currentFileMatches.length, 'current index before:', searchState.currentMatchIndex);

  if (searchState.currentFileMatches.length === 0) return;

  nextMatch();

  // Get fresh state after update
  const updatedState = getSearchState();
  console.log('After nextMatch, current index:', updatedState.currentMatchIndex);

  // Re-highlight all matches with updated current match
  highlightMatches(updatedState.currentFileMatches);

  const currentMatch = updatedState.currentFileMatches[updatedState.currentMatchIndex];
  if (currentMatch) {
    scrollToMatch(currentMatch, false);
  }
}

/**
 * Navigate to the previous match in the current file
 */
export function goToPreviousMatch(): void {
  const searchState = getSearchState();
  console.log('goToPreviousMatch called, matches:', searchState.currentFileMatches.length, 'current index before:', searchState.currentMatchIndex);

  if (searchState.currentFileMatches.length === 0) return;

  previousMatch();

  // Get fresh state after update
  const updatedState = getSearchState();
  console.log('After previousMatch, current index:', updatedState.currentMatchIndex);

  // Re-highlight all matches with updated current match
  highlightMatches(updatedState.currentFileMatches);

  const currentMatch = updatedState.currentFileMatches[updatedState.currentMatchIndex];
  if (currentMatch) {
    scrollToMatch(currentMatch, false);
  }
}

/**
 * Replace the current match
 */
export async function replaceCurrentMatch(): Promise<void> {
  const searchState = getSearchState();
  if (searchState.currentFileMatches.length === 0 || !state.content) return;

  const currentMatch = searchState.currentFileMatches[searchState.currentMatchIndex];
  if (!currentMatch) return;

  try {
    // Get lines
    const lines = state.content.split('\n');
    const lineIndex = currentMatch.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    const columnIndex = currentMatch.column - 1;

    // Replace the match in the line
    const newLine =
      line.substring(0, columnIndex) +
      searchState.replaceText +
      line.substring(columnIndex + currentMatch.length);

    lines[lineIndex] = newLine;

    // Update state and editor
    const newContent = lines.join('\n');
    state.content = newContent;
    state.isDirty = true;

    if (editor) {
      editor.textContent = newContent;
    }

    // Re-search to update match positions
    await searchInCurrentFile(searchState.query, searchState.options);
  } catch (error) {
    console.error('Replace failed:', error);
  }
}

/**
 * Replace all matches in the current file
 */
export async function replaceAllInCurrentFile(): Promise<void> {
  const searchState = getSearchState();
  if (!searchState.query || !state.content) return;

  try {
    const result = await invoke<{ newContent: string; replacedCount: number }>('replace_in_content', {
      query: searchState.query,
      replacement: searchState.replaceText,
      content: state.content,
      options: searchState.options,
    });

    if (result.replacedCount > 0) {
      // Update state and editor
      state.content = result.newContent;
      state.isDirty = true;

      if (editor) {
        editor.textContent = result.newContent;
      }

      // Clear matches and highlights
      setCurrentFileMatches([]);
      clearHighlights();

      console.log(`Replaced ${result.replacedCount} matches`);
    }
  } catch (error) {
    console.error('Replace all failed:', error);
  }
}
