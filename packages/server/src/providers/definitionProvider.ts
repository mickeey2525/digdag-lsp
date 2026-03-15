import {
  Definition,
  Location,
  Position,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import * as path from "path";
import * as fs from "fs";

// Operators whose values are file references
const FILE_REF_OPERATORS = new Set([
  "call>",
  "require>",
  "!include",
]);

// Operators whose values may be file paths (query files, scripts, etc.)
const FILE_PATH_OPERATORS = new Set([
  "td>",
  "sh>",
  "embulk>",
  "mail>",
]);

export function computeDefinition(
  textDoc: TextDocument,
  position: Position
): Definition | null {
  const lineText = getLineText(textDoc, position.line);

  // Check for !include (preprocessed as __digdag_include)
  const includeMatch = lineText.match(
    /^\s*(?:!include|__digdag_include)\s*:\s*['"]?([^'"#\s]+)['"]?/
  );
  if (includeMatch) {
    return resolveFileLocation(textDoc.uri, includeMatch[1], position.line, lineText, includeMatch[1]);
  }

  // Check for operator: value pattern
  const keyValueMatch = lineText.match(/^\s*([^\s:]+)\s*:\s*['"]?([^'"#\s]+)['"]?/);
  if (!keyValueMatch) return null;

  const key = keyValueMatch[1];
  const value = keyValueMatch[2];

  if (FILE_REF_OPERATORS.has(key)) {
    return resolveFileLocation(textDoc.uri, value, position.line, lineText, value);
  }

  if (FILE_PATH_OPERATORS.has(key)) {
    return resolveFileLocation(textDoc.uri, value, position.line, lineText, value);
  }

  return null;
}

function resolveFileLocation(
  docUri: string,
  filePath: string,
  line: number,
  lineText: string,
  rawValue: string
): Location | null {
  const docPath = URI.parse(docUri).fsPath;
  const docDir = path.dirname(docPath);

  // Ensure .dig extension for call> and require>
  let targetPath = filePath;
  if (!path.extname(targetPath)) {
    targetPath += ".dig";
  }

  const resolved = path.resolve(docDir, targetPath);

  if (!fs.existsSync(resolved)) {
    // Also try without the auto-appended extension
    const resolvedRaw = path.resolve(docDir, filePath);
    if (!fs.existsSync(resolvedRaw)) {
      return null;
    }
    return {
      uri: URI.file(resolvedRaw).toString(),
      range: Range.create(0, 0, 0, 0),
    };
  }

  return {
    uri: URI.file(resolved).toString(),
    range: Range.create(0, 0, 0, 0),
  };
}

function getLineText(doc: TextDocument, line: number): string {
  const start = { line, character: 0 };
  const end = { line, character: Number.MAX_SAFE_INTEGER };
  return doc.getText({ start, end });
}
