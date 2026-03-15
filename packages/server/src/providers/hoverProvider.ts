import { Hover, Position, MarkupKind } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DigdagDocument } from "../model/digdagDocument";
import { Task } from "../model/task";
import { getOperator } from "../data/operators";
import { getDirective } from "../data/directives";
import { getVariable } from "../data/variables";
import { SCHEDULE_TYPES } from "../data/scheduleTypes";
import { findTaskAtPosition } from "../utils/documentUtils";

export function computeHover(
  doc: DigdagDocument,
  textDoc: TextDocument,
  position: Position
): Hover | null {
  const lineText = getLineText(textDoc, position.line);

  // Check for variable hover: ${...}
  const varHover = checkVariableHover(lineText, position);
  if (varHover) return varHover;

  // Extract the key at cursor position
  const keyMatch = lineText.match(/^\s*([^\s:]+)\s*:/);
  if (!keyMatch) return null;

  const key = keyMatch[1];
  const keyStart = lineText.indexOf(key);
  const keyEnd = keyStart + key.length;

  if (position.character < keyStart || position.character > keyEnd) {
    return null;
  }

  // Operator hover
  if (key.endsWith(">")) {
    const opDef = getOperator(key);
    if (opDef) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: formatOperatorHover(opDef),
        },
      };
    }
    // Check schedule types
    const schedDef = SCHEDULE_TYPES.find((s) => s.name === key);
    if (schedDef) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${schedDef.name}** (schedule)\n\n${schedDef.description}${schedDef.example ? `\n\n**Example:** \`${schedDef.example}\`` : ""}`,
        },
      };
    }
  }

  // Directive hover
  if (key.startsWith("_")) {
    const dirDef = getDirective(key);
    if (dirDef) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${dirDef.name}** (directive)\n\n${dirDef.description}${dirDef.validValues ? `\n\n**Valid values:** ${dirDef.validValues}` : ""}`,
        },
      };
    }
  }

  // Top-level key hover
  const topLevelDocs: Record<string, string> = {
    timezone: "Sets the timezone for this workflow's sessions and schedule.",
    schedule: "Defines the schedule for automatic workflow execution.",
    sla: "Defines SLA (Service Level Agreement) rules.",
    meta: "Metadata for the workflow.",
    _export: "Exports variables to all tasks in this workflow.",
  };

  if (topLevelDocs[key]) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${key}**\n\n${topLevelDocs[key]}`,
      },
    };
  }

  // Task hover
  if (key.startsWith("+")) {
    const task = findTaskAtPosition(doc, position);
    if (task) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: formatTaskHover(task),
        },
      };
    }
  }

  return null;
}

function checkVariableHover(
  lineText: string,
  position: Position
): Hover | null {
  const regex = /\$\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(lineText)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position.character >= start && position.character <= end) {
      const expr = match[1];
      const varName = expr.split(/[.([\s]/)[0].trim();
      const varDef = getVariable(varName);
      if (varDef) {
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `**\${${varName}}**\n\n${varDef.description}${varDef.example ? `\n\n**Example:** \`${varDef.example}\`` : ""}`,
          },
        };
      }
    }
  }
  return null;
}

function formatOperatorHover(
  op: ReturnType<typeof getOperator> & object
): string {
  let md = `**${op.name}** (operator)\n\n${op.description}`;

  if (op.params && op.params.length > 0) {
    md += "\n\n**Parameters:**\n";
    for (const p of op.params) {
      md += `- \`${p.name}\`: ${p.description}${p.required ? " *(required)*" : ""}\n`;
    }
  }

  if (op.example) {
    md += `\n**Example:**\n\`\`\`yaml\n${op.example}\n\`\`\``;
  }

  return md;
}

function formatTaskHover(task: Task): string {
  let md = `**${task.name}** (task)`;

  if (task.operator) {
    md += `\n\nOperator: \`${task.operator.name}\``;
  }
  if (task.subtasks.length > 0) {
    md += `\n\nSubtasks: ${task.subtasks.map((t) => t.name).join(", ")}`;
  }
  if (task.directives.length > 0) {
    md += `\n\nDirectives: ${task.directives.map((d) => d.name).join(", ")}`;
  }

  return md;
}

function getLineText(doc: TextDocument, line: number): string {
  const start = { line, character: 0 };
  const end = { line, character: Number.MAX_SAFE_INTEGER };
  return doc.getText({ start, end });
}
