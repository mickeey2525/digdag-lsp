import { LSPRange } from "../model/types";

export class LineOffsetTable {
  private lineStarts: number[];

  constructor(text: string) {
    this.lineStarts = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") {
        this.lineStarts.push(i + 1);
      }
    }
  }

  offsetToPosition(offset: number): { line: number; character: number } {
    let low = 0;
    let high = this.lineStarts.length - 1;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (this.lineStarts[mid] <= offset) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return { line: low, character: offset - this.lineStarts[low] };
  }

  positionToOffset(line: number, character: number): number {
    if (line < 0 || line >= this.lineStarts.length) return 0;
    return this.lineStarts[line] + character;
  }

  rangeFromOffsets(start: number, end: number): LSPRange {
    return {
      start: this.offsetToPosition(start),
      end: this.offsetToPosition(end),
    };
  }
}
