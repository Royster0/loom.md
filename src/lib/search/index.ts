/**
 * Search module exports
 * Main entry point for search functionality
 */

export { openSearchModal, closeSearchModal, toggleSearchModal, createSearchModal } from './search-modal';
export { searchInCurrentFile, goToNextMatch, goToPreviousMatch, replaceCurrentMatch, replaceAllInCurrentFile } from './current-file-search';
export { searchInFolder } from './multi-file-search';
export { getSearchState, updateSearchState, resetSearchState } from './search-state';
export { highlightMatches, clearHighlights } from './search-highlighting';
export type { SearchOptions, SearchMatch, FileSearchResult, SearchState } from './search-state';
