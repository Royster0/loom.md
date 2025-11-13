/**
 * Search highlighting functionality
 * Highlights search matches in the editor
 */

import { getSearchState } from './search-state';
import type { SearchMatch } from './search-state';
import { editor } from '../core/dom';

// Store highlight elements for cleanup
let highlightElements: HTMLElement[] = [];

/**
 * Apply highlights to search matches in the editor
 */
export function highlightMatches(matches: SearchMatch[]): void {
  // Clear existing highlights
  clearHighlights();

  if (!editor || matches.length === 0) {
    return;
  }

  const editorContent = editor.textContent || '';
  const lines = editorContent.split('\n');

  matches.forEach((match, index) => {
    const lineIndex = match.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      highlightMatchInLine(match, index);
    }
  });
}

/**
 * Highlight a specific match in a line
 */
function highlightMatchInLine(match: SearchMatch, matchIndex: number): void {
  if (!editor) return;

  const searchState = getSearchState();
  const isCurrentMatch = matchIndex === searchState.currentMatchIndex;

  // Create a temporary div to calculate positions
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = window.getComputedStyle(editor).cssText;
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.whiteSpace = 'pre';
  tempDiv.style.pointerEvents = 'none';
  document.body.appendChild(tempDiv);

  const editorContent = editor.textContent || '';
  const lines = editorContent.split('\n');
  const lineIndex = match.line - 1;

  if (lineIndex < 0 || lineIndex >= lines.length) {
    document.body.removeChild(tempDiv);
    return;
  }

  const lineText = lines[lineIndex];
  const columnIndex = match.column - 1;

  // Calculate line position
  let lineTop = 0;
  for (let i = 0; i < lineIndex; i++) {
    tempDiv.textContent = lines[i] || ' ';
    lineTop += tempDiv.offsetHeight;
  }

  // Calculate column position
  tempDiv.textContent = lineText.substring(0, columnIndex);
  const left = tempDiv.offsetWidth;

  // Calculate match width
  tempDiv.textContent = lineText.substring(columnIndex, columnIndex + match.length);
  const width = tempDiv.offsetWidth;
  const height = tempDiv.offsetHeight;

  document.body.removeChild(tempDiv);

  // Create highlight element
  const highlight = document.createElement('div');
  highlight.className = isCurrentMatch ? 'search-highlight-current' : 'search-highlight';
  highlight.style.position = 'absolute';
  highlight.style.left = `${left}px`;
  highlight.style.top = `${lineTop}px`;
  highlight.style.width = `${width}px`;
  highlight.style.height = `${height}px`;
  highlight.style.backgroundColor = isCurrentMatch ? 'rgba(255, 165, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)';
  highlight.style.pointerEvents = 'none';
  highlight.style.borderRadius = '2px';
  highlight.style.zIndex = '1';

  // Add to editor (we'll need a wrapper for highlights)
  if (!editor.parentElement) return;

  let highlightContainer = editor.parentElement.querySelector('.search-highlights-container') as HTMLElement;
  if (!highlightContainer) {
    highlightContainer = document.createElement('div');
    highlightContainer.className = 'search-highlights-container';
    highlightContainer.style.position = 'absolute';
    highlightContainer.style.top = '0';
    highlightContainer.style.left = '0';
    highlightContainer.style.width = '100%';
    highlightContainer.style.height = '100%';
    highlightContainer.style.pointerEvents = 'none';
    highlightContainer.style.overflow = 'hidden';
    editor.parentElement.style.position = 'relative';
    editor.parentElement.insertBefore(highlightContainer, editor);
  }

  highlightContainer.appendChild(highlight);
  highlightElements.push(highlight);
}

/**
 * Clear all search highlights
 */
export function clearHighlights(): void {
  if (!editor || !editor.parentElement) return;

  const highlightContainer = editor.parentElement.querySelector('.search-highlights-container');
  if (highlightContainer) {
    highlightContainer.remove();
  }

  highlightElements = [];
}

/**
 * Scroll to a specific match
 */
export function scrollToMatch(match: SearchMatch): void {
  if (!editor) return;

  const editorContent = editor.textContent || '';
  const lines = editorContent.split('\n');
  const lineIndex = match.line - 1;

  if (lineIndex < 0 || lineIndex >= lines.length) {
    return;
  }

  // Calculate the position to scroll to
  const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight) || 20;
  const scrollTop = lineIndex * lineHeight;

  // Scroll the editor
  if (editor.parentElement) {
    editor.parentElement.scrollTop = scrollTop - (editor.parentElement.clientHeight / 2);
  }

  // Also update the editor focus
  editor.focus();
}

/**
 * Update highlight for current match (when navigating)
 */
export function updateCurrentMatchHighlight(): void {
  const searchState = getSearchState();
  if (searchState.currentFileMatches.length === 0) return;

  // Re-highlight all matches to update the current match styling
  highlightMatches(searchState.currentFileMatches);

  // Scroll to the current match
  const currentMatch = searchState.currentFileMatches[searchState.currentMatchIndex];
  if (currentMatch) {
    scrollToMatch(currentMatch);
  }
}
