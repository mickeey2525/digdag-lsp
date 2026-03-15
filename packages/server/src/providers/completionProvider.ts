import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  TextDocument,
} from "vscode-languageserver";
import { TextDocument as TDoc } from "vscode-languageserver-textdocument";
import { DigdagDocument } from "../model/digdagDocument";
import { OPERATORS, getOperator } from "../data/operators";
import { DIRECTIVES } from "../data/directives";
import { BUILTIN_VARIABLES } from "../data/variables";
import { SCHEDULE_TYPES } from "../data/scheduleTypes";
import { findTaskAtPosition } from "../utils/documentUtils";

export function computeCompletions(
  doc: DigdagDocument,
  textDoc: TDoc,
  position: Position
): CompletionItem[] {
  const lineText = getLineText(textDoc, position.line);
  const textBefore = lineText.substring(0, position.character);

  // Inside ${...} — variable completion
  const varMatch = textBefore.match(/\$\{([^}]*)$/);
  if (varMatch) {
    return variableCompletions(varMatch[1]);
  }

  // After "schedule:" block — schedule types
  if (isInScheduleContext(textDoc, position)) {
    return scheduleCompletions();
  }

  const indent = getIndentLevel(textBefore);

  // Root level (no indent) — top-level keys and tasks
  if (indent === 0) {
    return rootCompletions();
  }

  // Inside a task — operators, directives, subtasks, or operator params
  return taskCompletions(doc, position);
}

function variableCompletions(prefix: string): CompletionItem[] {
  return BUILTIN_VARIABLES.filter((v) => v.name.startsWith(prefix)).map(
    (v) => ({
      label: v.name,
      kind: CompletionItemKind.Variable,
      detail: v.example,
      documentation: v.description,
    })
  );
}

function scheduleCompletions(): CompletionItem[] {
  return SCHEDULE_TYPES.map((s) => ({
    label: s.name,
    kind: CompletionItemKind.Property,
    detail: s.params,
    documentation: `${s.description}${s.example ? `\n\nExample: ${s.example}` : ""}`,
    insertText: `${s.name} `,
    insertTextFormat: InsertTextFormat.PlainText,
  }));
}

function rootCompletions(): CompletionItem[] {
  const items: CompletionItem[] = [
    {
      label: "+task",
      kind: CompletionItemKind.Function,
      documentation: "Define a new task",
      insertText: "+${1:task_name}:\n  ",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "timezone",
      kind: CompletionItemKind.Property,
      documentation: "Set the workflow timezone",
      insertText: "timezone: ${1:UTC}",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "schedule",
      kind: CompletionItemKind.Property,
      documentation: "Configure workflow schedule",
      insertText: "schedule:\n  ${1:daily>}: ${2:07:00:00}",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "sla",
      kind: CompletionItemKind.Property,
      documentation: "Define SLA rules for the workflow",
      insertText: "sla:\n  ",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "_export",
      kind: CompletionItemKind.Property,
      documentation: "Export variables to all tasks",
      insertText: "_export:\n  ${1:key}: ${2:value}",
      insertTextFormat: InsertTextFormat.Snippet,
    },
  ];
  return items;
}

function taskCompletions(
  doc: DigdagDocument,
  position: Position
): CompletionItem[] {
  const task = findTaskAtPosition(doc, position);

  // If task has an operator, suggest operator-specific params
  if (task?.operator) {
    const opDef = getOperator(task.operator.name);
    if (opDef) {
      return operatorParamCompletions(task, opDef);
    }
  }

  // No operator yet — return generic list (all operators + directives + subtask)
  return genericTaskCompletions();
}

function operatorParamCompletions(
  task: NonNullable<ReturnType<typeof findTaskAtPosition>>,
  opDef: NonNullable<ReturnType<typeof getOperator>>
): CompletionItem[] {
  // Collect already-used keys
  const usedKeys = new Set<string>();
  if (task.operator) {
    usedKeys.add(task.operator.name);
  }
  for (const d of task.directives) {
    usedKeys.add(d.name);
  }
  for (const c of task.config) {
    usedKeys.add(c.key);
  }

  const items: CompletionItem[] = [];

  // Operator-specific params (excluding already-used and the operator key itself)
  for (const p of opDef.params) {
    if (usedKeys.has(p.name)) continue;
    items.push({
      label: p.name,
      kind: CompletionItemKind.Property,
      detail: `${opDef.name} parameter`,
      documentation: p.description,
      insertText: `${p.name}: `,
      insertTextFormat: InsertTextFormat.PlainText,
      sortText: p.required ? `0${p.name}` : `1${p.name}`,
    });
  }

  // Directives (excluding already-used)
  for (const dir of DIRECTIVES) {
    if (usedKeys.has(dir.name)) continue;
    items.push({
      label: dir.name,
      kind: CompletionItemKind.Keyword,
      detail: "directive",
      documentation: `${dir.description}${dir.validValues ? `\n\nValid values: ${dir.validValues}` : ""}`,
      insertText: `${dir.name}: `,
      insertTextFormat: InsertTextFormat.PlainText,
      sortText: `2${dir.name}`,
    });
  }

  // Subtask
  items.push({
    label: "+subtask",
    kind: CompletionItemKind.Function,
    documentation: "Define a subtask",
    insertText: "+${1:subtask_name}:\n  ",
    insertTextFormat: InsertTextFormat.Snippet,
    sortText: "3+subtask",
  });

  return items;
}

function genericTaskCompletions(): CompletionItem[] {
  const items: CompletionItem[] = [];

  // Operators
  for (const op of OPERATORS) {
    items.push({
      label: op.name,
      kind: CompletionItemKind.Function,
      detail: "operator",
      documentation: `${op.description}${op.example ? `\n\nExample: ${op.example}` : ""}`,
      insertText: `${op.name} `,
      insertTextFormat: InsertTextFormat.PlainText,
    });
  }

  // Directives
  for (const dir of DIRECTIVES) {
    items.push({
      label: dir.name,
      kind: CompletionItemKind.Keyword,
      detail: "directive",
      documentation: `${dir.description}${dir.validValues ? `\n\nValid values: ${dir.validValues}` : ""}`,
      insertText: `${dir.name}: `,
      insertTextFormat: InsertTextFormat.PlainText,
    });
  }

  // Subtask
  items.push({
    label: "+subtask",
    kind: CompletionItemKind.Function,
    documentation: "Define a subtask",
    insertText: "+${1:subtask_name}:\n  ",
    insertTextFormat: InsertTextFormat.Snippet,
  });

  return items;
}

function getLineText(doc: TDoc, line: number): string {
  const start = { line, character: 0 };
  const end = { line, character: Number.MAX_SAFE_INTEGER };
  return doc.getText({ start, end });
}

function getIndentLevel(text: string): number {
  const match = text.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function isInScheduleContext(doc: TDoc, position: Position): boolean {
  // Walk backwards to find if we're inside a schedule: block
  for (let line = position.line - 1; line >= 0; line--) {
    const lineText = getLineText(doc, line);
    const trimmed = lineText.trimStart();
    if (trimmed.startsWith("schedule:") || trimmed.startsWith("schedule :")) {
      return true;
    }
    // If we hit a non-indented line that's not schedule, we're out
    if (trimmed.length > 0 && !lineText.startsWith(" ") && !lineText.startsWith("\t")) {
      return false;
    }
  }
  return false;
}
