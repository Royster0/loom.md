/**
 * Path utility functions
 * Centralized path manipulation utilities to avoid duplication
 */

/**
 * Get the separator used in a path (\ for Windows, / for Unix)
 * @param path - The path to analyze
 * @returns The path separator character
 */
export function getPathSeparator(path: string): string {
  return path.includes("\\") ? "\\" : "/";
}

/**
 * Extract filename from a path
 * @param path - The full path
 * @returns The filename (last component of the path)
 */
export function getFilename(path: string): string {
  return path.split(/[\\/]/).pop() || "";
}

/**
 * Get the parent directory from a path
 * @param path - The full path
 * @returns The parent directory path
 */
export function getParentDirectory(path: string): string {
  const separator = getPathSeparator(path);
  const parts = path.split(separator);
  parts.pop();
  return parts.join(separator);
}

/**
 * Join path components using the appropriate separator
 * @param basePath - The base path
 * @param components - Path components to join
 * @returns The joined path
 */
export function joinPath(basePath: string, ...components: string[]): string {
  const separator = getPathSeparator(basePath);
  return [basePath, ...components].join(separator);
}

/**
 * Check if a file path is an image based on extension
 * @param path - Path to the file
 * @returns True if the file is an image
 */
export function isImagePath(path: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  const lowerPath = path.toLowerCase();
  return imageExtensions.some(ext => lowerPath.endsWith(ext));
}
