import { Range, DiagnosticSeverity } from "vscode-languageserver";

export interface LSPRange {
  start: { line: number; character: number };
  end: { line: number; character: number };
}

export interface ValueWithRange<T> {
  value: T;
  range: LSPRange;
}

export interface DiagnosticInfo {
  message: string;
  range: LSPRange;
  severity: DiagnosticSeverity;
}

export interface Operator {
  name: string;
  value: unknown;
  range: LSPRange;
}

export interface Directive {
  name: string;
  value: unknown;
  range: LSPRange;
}

export interface ConfigEntry {
  key: string;
  value: unknown;
  range: LSPRange;
}

export interface ScheduleBlock {
  range: LSPRange;
  entries: ConfigEntry[];
}

export function toLSPRange(range: LSPRange): Range {
  return {
    start: { line: range.start.line, character: range.start.character },
    end: { line: range.end.line, character: range.end.character },
  };
}
