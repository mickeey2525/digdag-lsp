import {
  parseDocument,
  isMap,
  isScalar,
  isPair,
  YAMLMap,
  Pair,
  Document,
} from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";
import { DigdagDocument } from "../model/digdagDocument";
import { Task } from "../model/task";
import {
  LSPRange,
  DiagnosticInfo,
  Operator,
  Directive,
  ConfigEntry,
  ScheduleBlock,
  ValueWithRange,
} from "../model/types";
import { LineOffsetTable } from "../utils/positionUtils";
import {
  getKeyName,
  isTaskKey,
  isOperatorKey,
  isDirectiveKey,
  forEachPair,
} from "../utils/yamlUtils";
import { parseVariables } from "./variableParser";

const TOP_LEVEL_KEYS = new Set([
  "timezone",
  "schedule",
  "sla",
  "meta",
  "_export",
  "_error",
  "_check",
]);

// Digdag uses `!include: <path>` which is not valid YAML tag syntax.
// Replace `!include:` with a safe key so the YAML parser doesn't choke.
const INCLUDE_RE = /^(\s*)!include\s*:\s*/gm;

// Replace ${...} interpolations with same-length placeholders so that
// quotes, colons, and brackets inside expressions don't confuse the
// YAML parser.  Offsets are preserved because the placeholder is
// padded to exactly the same byte length as the original token.
function neutralizeInterpolations(text: string): string {
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "$" && i + 1 < text.length && text[i + 1] === "{") {
      const start = i;
      i += 2;
      let depth = 1;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") depth--;
        if (depth > 0) i++;
      }
      if (depth === 0) {
        i++; // skip closing }
        const len = i - start;
        // "__X" + "_".repeat(len - 4) + "X" keeps the same length
        result.push("__" + "_".repeat(len - 2));
      } else {
        // unclosed — leave as-is so variableParser can report the error
        result.push(text.substring(start));
        break;
      }
    } else {
      result.push(text[i]);
      i++;
    }
  }
  return result.join("");
}

function preprocessDigdagYaml(text: string): string {
  let out = text.replace(INCLUDE_RE, "$1__digdag_include: ");
  out = neutralizeInterpolations(out);
  return out;
}

export function parse(uri: string, text: string): DigdagDocument {
  const lineOffset = new LineOffsetTable(text);
  const doc: DigdagDocument = {
    uri,
    tasks: [],
    yamlErrors: [],
  };

  const preprocessed = preprocessDigdagYaml(text);

  let yamlDoc: Document;
  try {
    yamlDoc = parseDocument(preprocessed, {
      keepSourceTokens: true,
      // Match digdag's YAML behavior: disable auto-conversion of
      // timestamps (2024-01-01) and sexagesimal integers (10:00:00).
      // Only true/false are booleans (not Yes/No/On/Off).
      schema: "core",
    });
  } catch (e) {
    doc.yamlErrors.push({
      message: `YAML parse error: ${e instanceof Error ? e.message : String(e)}`,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      severity: DiagnosticSeverity.Error,
    });
    return doc;
  }

  // Forward YAML errors
  for (const error of yamlDoc.errors) {
    const range = error.pos
      ? lineOffset.rangeFromOffsets(error.pos[0], error.pos[1])
      : { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } };
    doc.yamlErrors.push({
      message: error.message,
      range,
      severity: DiagnosticSeverity.Error,
    });
  }

  for (const warning of yamlDoc.warnings) {
    const range = warning.pos
      ? lineOffset.rangeFromOffsets(warning.pos[0], warning.pos[1])
      : { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } };
    doc.yamlErrors.push({
      message: warning.message,
      range,
      severity: DiagnosticSeverity.Warning,
    });
  }

  const root = yamlDoc.contents;
  if (!isMap(root)) {
    return doc;
  }

  // Parse variable interpolations
  const { errors: varErrors } = parseVariables(text, lineOffset);
  doc.yamlErrors.push(...varErrors);

  forEachPair(root, (pair, key) => {
    const range = pairRange(pair, lineOffset);

    if (key === "timezone" && isScalar(pair.value)) {
      doc.timezone = {
        value: String(pair.value.value),
        range,
      };
    } else if (key === "schedule" && isMap(pair.value)) {
      doc.schedule = parseScheduleBlock(pair.value, lineOffset);
    } else if (key === "_export" && isMap(pair.value)) {
      doc.globalExports = pair.value.toJSON() as Record<string, unknown>;
    } else if (isTaskKey(key)) {
      doc.tasks.push(parseTask(pair, key, lineOffset));
    }
  });

  return doc;
}

function parseTask(pair: Pair, name: string, lineOffset: LineOffsetTable): Task {
  const range = pairRange(pair, lineOffset);
  const task: Task = {
    name,
    range,
    operators: [],
    directives: [],
    subtasks: [],
    config: [],
  };

  if (!isMap(pair.value)) {
    return task;
  }

  forEachPair(pair.value, (childPair, key) => {
    const childRange = pairRange(childPair, lineOffset);

    if (isTaskKey(key)) {
      task.subtasks.push(parseTask(childPair, key, lineOffset));
    } else if (isOperatorKey(key)) {
      const op: Operator = {
        name: key,
        value: isScalar(childPair.value) ? childPair.value.value : childPair.value,
        range: childRange,
      };
      task.operators.push(op);
      task.operator = op;
    } else if (isDirectiveKey(key)) {
      const directive: Directive = {
        name: key,
        value: isScalar(childPair.value) ? childPair.value.value : childPair.value,
        range: childRange,
      };
      task.directives.push(directive);

      if (key === "_parallel") {
        task.hasParallel = isScalar(childPair.value) && childPair.value.value === true;
      }
      if (key === "_background") {
        task.hasBackground = isScalar(childPair.value) && childPair.value.value === true;
      }
    } else {
      task.config.push({
        key,
        value: isScalar(childPair.value) ? childPair.value.value : childPair.value,
        range: childRange,
      });
    }
  });

  return task;
}

function parseScheduleBlock(
  map: YAMLMap,
  lineOffset: LineOffsetTable
): ScheduleBlock {
  const entries: ConfigEntry[] = [];
  let blockRange: LSPRange = {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 0 },
  };

  if (map.range) {
    blockRange = lineOffset.rangeFromOffsets(map.range[0], map.range[2] ?? map.range[1]);
  }

  forEachPair(map, (pair, key) => {
    entries.push({
      key,
      value: isScalar(pair.value) ? pair.value.value : pair.value,
      range: pairRange(pair, lineOffset),
    });
  });

  return { range: blockRange, entries };
}

function pairRange(pair: Pair, lineOffset: LineOffsetTable): LSPRange {
  const keyNode = pair.key;
  const valueNode = pair.value;

  let startOffset = 0;
  let endOffset = 0;

  if (isScalar(keyNode) && keyNode.range) {
    startOffset = keyNode.range[0];
    endOffset = keyNode.range[1];
  }

  if (isScalar(valueNode) && valueNode.range) {
    endOffset = valueNode.range[1];
  } else if (isMap(valueNode) && valueNode.range) {
    endOffset = valueNode.range[2] ?? valueNode.range[1];
  }

  if (endOffset <= startOffset) {
    endOffset = startOffset + 1;
  }

  return lineOffset.rangeFromOffsets(startOffset, endOffset);
}

export { LineOffsetTable };
