/**
 * Cursor and selection utilities
 * Centralized cursor position and selection utilities
 */

/**
 * Get the cursor position within a line element
 * @param lineElement - The line element containing the cursor
 * @param range - The current selection range
 * @returns The cursor offset position
 */
export function getCursorPosition(lineElement: HTMLElement, range: Range): number {
  const preRange = range.cloneRange();
  preRange.selectNodeContents(lineElement);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

/**
 * Set cursor position in an element
 * @param element - The element to set cursor in
 * @param offset - The character offset to position the cursor
 * @param textNode - Optional specific text node to use
 */
export function setCursorPosition(
  element: HTMLElement,
  offset: number,
  textNode?: Node
): void {
  const selection = window.getSelection();
  if (!selection) return;

  const targetNode = textNode || element.firstChild;
  if (!targetNode) return;

  try {
    if (targetNode.nodeType === Node.TEXT_NODE && targetNode.textContent) {
      const range = document.createRange();
      const safeOffset = Math.min(offset, targetNode.textContent.length);
      range.setStart(targetNode, safeOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } catch (e) {
    console.warn("Failed to set cursor position:", e);
  }
}

/**
 * Find the first text node in an element
 * @param element - The element to search
 * @returns The first text node found, or null
 */
export function getFirstTextNode(element: Node): Node | null {
  if (element.nodeType === Node.TEXT_NODE) {
    return element;
  }

  for (let i = 0; i < element.childNodes.length; i++) {
    const textNode = getFirstTextNode(element.childNodes[i]);
    if (textNode) {
      return textNode;
    }
  }

  return null;
}

/**
 * Find a text node at a specific offset within an element
 * @param element - The element to search
 * @param targetOffset - The target character offset
 * @returns Object containing the found text node and offset within that node
 */
export function findTextNodeAtOffset(
  element: HTMLElement,
  targetOffset: number
): { node: Node | null; offset: number } {
  let currentOffset = 0;
  let targetNode: Node | null = null;
  let nodeOffset = 0;

  const findNode = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (currentOffset + textLength >= targetOffset) {
        targetNode = node;
        nodeOffset = targetOffset - currentOffset;
        return true;
      }
      currentOffset += textLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (findNode(node.childNodes[i])) {
          return true;
        }
      }
    }
    return false;
  };

  findNode(element);
  return { node: targetNode, offset: nodeOffset };
}

/**
 * Save the current cursor position in an element
 * @param element - The element containing the cursor
 * @returns The saved cursor offset, or 0 if not found
 */
export function saveCursorPosition(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

/**
 * Restore cursor position in an element
 * @param element - The element to restore cursor in
 * @param offset - The character offset to restore
 */
export function restoreCursorPosition(element: HTMLElement, offset: number): void {
  const { node, offset: nodeOffset } = findTextNodeAtOffset(element, offset);

  if (node && node.nodeType === Node.TEXT_NODE) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(node, nodeOffset);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
