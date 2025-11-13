/**
 * Search state management
 * Tracks the current search query, options, results, and UI state
 */

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchMatch {
  line: number;
  column: number;
  length: number;
  text: string;
  lineText: string;
}

export interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

export interface SearchState {
  // UI State
  isOpen: boolean;
  showReplace: boolean;

  // Search Query
  query: string;
  replaceText: string;
  options: SearchOptions;

  // Search Results
  currentFileMatches: SearchMatch[];
  multiFileResults: FileSearchResult[];
  currentMatchIndex: number;
  totalMatches: number;

  // Search Mode
  searchInAllFiles: boolean;
}

// Global search state
let searchState: SearchState = {
  isOpen: false,
  showReplace: false,
  query: '',
  replaceText: '',
  options: {
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  },
  currentFileMatches: [],
  multiFileResults: [],
  currentMatchIndex: 0,
  totalMatches: 0,
  searchInAllFiles: false,
};

/**
 * Get the current search state
 */
export function getSearchState(): SearchState {
  return searchState;
}

/**
 * Update search state
 */
export function updateSearchState(updates: Partial<SearchState>): void {
  searchState = { ...searchState, ...updates };
}

/**
 * Reset search state to defaults
 */
export function resetSearchState(): void {
  searchState = {
    isOpen: false,
    showReplace: false,
    query: '',
    replaceText: '',
    options: {
      caseSensitive: false,
      wholeWord: false,
      useRegex: false,
    },
    currentFileMatches: [],
    multiFileResults: [],
    currentMatchIndex: 0,
    totalMatches: 0,
    searchInAllFiles: false,
  };
}

/**
 * Update search options
 */
export function updateSearchOptions(options: Partial<SearchOptions>): void {
  searchState.options = { ...searchState.options, ...options };
}

/**
 * Set current file matches
 */
export function setCurrentFileMatches(matches: SearchMatch[]): void {
  searchState.currentFileMatches = matches;
  searchState.totalMatches = matches.length;
  searchState.currentMatchIndex = matches.length > 0 ? 0 : -1;
}

/**
 * Set multi-file search results
 */
export function setMultiFileResults(results: FileSearchResult[]): void {
  searchState.multiFileResults = results;
  const totalMatches = results.reduce((sum, result) => sum + result.matches.length, 0);
  searchState.totalMatches = totalMatches;
}

/**
 * Navigate to next match
 */
export function nextMatch(): void {
  if (searchState.totalMatches === 0) return;
  searchState.currentMatchIndex = (searchState.currentMatchIndex + 1) % searchState.totalMatches;
}

/**
 * Navigate to previous match
 */
export function previousMatch(): void {
  if (searchState.totalMatches === 0) return;
  searchState.currentMatchIndex =
    (searchState.currentMatchIndex - 1 + searchState.totalMatches) % searchState.totalMatches;
}

/**
 * Get the current match
 */
export function getCurrentMatch(): SearchMatch | null {
  if (searchState.totalMatches === 0 || searchState.currentMatchIndex < 0) {
    return null;
  }

  if (searchState.searchInAllFiles && searchState.multiFileResults.length > 0) {
    // Find the match across multiple files
    let count = 0;
    for (const result of searchState.multiFileResults) {
      if (count + result.matches.length > searchState.currentMatchIndex) {
        return result.matches[searchState.currentMatchIndex - count];
      }
      count += result.matches.length;
    }
  } else {
    return searchState.currentFileMatches[searchState.currentMatchIndex];
  }

  return null;
}
