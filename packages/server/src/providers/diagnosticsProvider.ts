import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { DigdagDocument } from "../model/digdagDocument";
import { Task } from "../model/task";
import { DiagnosticInfo, toLSPRange } from "../model/types";
import { isKnownOperator, getOperator } from "../data/operators";
import { isKnownDirective } from "../data/directives";

export function computeDiagnostics(doc: DigdagDocument): Diagnostic[] {
  const diagnostics: DiagnosticInfo[] = [...doc.yamlErrors];

  for (const task of doc.tasks) {
    validateTask(task, undefined, diagnostics);
  }

  return diagnostics.map((d) => ({
    message: d.message,
    range: toLSPRange(d.range),
    severity: d.severity,
    source: "digdag",
  }));
}

function validateTask(
  task: Task,
  parent: Task | undefined,
  diagnostics: DiagnosticInfo[]
): void {
  // Task name must start with +
  if (!task.name.startsWith("+")) {
    diagnostics.push({
      message: `Task name must start with '+': ${task.name}`,
      range: task.range,
      severity: DiagnosticSeverity.Error,
    });
  }

  // Only one operator per task
  if (task.operators.length > 1) {
    for (const op of task.operators.slice(1)) {
      diagnostics.push({
        message: `Only one operator is allowed per task. Found duplicate: ${op.name}`,
        range: op.range,
        severity: DiagnosticSeverity.Error,
      });
    }
  }

  // Cannot have operator AND subtasks
  if (task.operators.length > 0 && task.subtasks.length > 0) {
    diagnostics.push({
      message: `Task '${task.name}' cannot have both an operator (${task.operators[0].name}) and subtasks`,
      range: task.range,
      severity: DiagnosticSeverity.Error,
    });
  }

  // Unknown operator
  for (const op of task.operators) {
    if (!isKnownOperator(op.name)) {
      diagnostics.push({
        message: `Unknown operator: ${op.name}`,
        range: op.range,
        severity: DiagnosticSeverity.Warning,
      });
    }
  }

  // Unknown directive
  for (const directive of task.directives) {
    if (!isKnownDirective(directive.name)) {
      diagnostics.push({
        message: `Unknown directive: ${directive.name}`,
        range: directive.range,
        severity: DiagnosticSeverity.Warning,
      });
    }
  }

  // _after requires _parallel in parent
  const hasAfter = task.directives.some((d) => d.name === "_after");
  if (hasAfter && (!parent || !parent.hasParallel)) {
    diagnostics.push({
      message: `'_after' requires '_parallel: true' in the parent task`,
      range: task.directives.find((d) => d.name === "_after")!.range,
      severity: DiagnosticSeverity.Warning,
    });
  }

  // _background conflicts with _parallel
  if (task.hasBackground && task.hasParallel) {
    diagnostics.push({
      message: `'_background' and '_parallel' should not be used together on the same task`,
      range: task.range,
      severity: DiagnosticSeverity.Warning,
    });
  }

  // Validate operator parameters
  if (task.operators.length === 1) {
    const op = task.operators[0];
    const opDef = getOperator(op.name);
    if (opDef) {
      const validParamNames = new Set(opDef.params.map((p) => p.name));

      // Unknown parameters
      for (const entry of task.config) {
        if (!validParamNames.has(entry.key)) {
          diagnostics.push({
            message: `Unknown parameter '${entry.key}' for operator '${op.name}'`,
            range: entry.range,
            severity: DiagnosticSeverity.Warning,
          });
        }
      }

      // Missing required parameters (excluding the operator key itself)
      const presentKeys = new Set([
        op.name,
        ...task.config.map((e) => e.key),
      ]);
      for (const param of opDef.params) {
        if (param.required && !presentKeys.has(param.name)) {
          diagnostics.push({
            message: `Missing required parameter '${param.name}' for operator '${op.name}'`,
            range: op.range,
            severity: DiagnosticSeverity.Error,
          });
        }
      }
    }
  }

  // _retry shape validation
  const retryDirective = task.directives.find((d) => d.name === "_retry");
  if (retryDirective) {
    validateRetry(retryDirective.value, retryDirective.range, diagnostics);
  }

  // Recurse into subtasks
  for (const subtask of task.subtasks) {
    validateTask(subtask, task, diagnostics);
  }
}

function validateRetry(
  value: unknown,
  range: DiagnosticInfo["range"],
  diagnostics: DiagnosticInfo[]
): void {
  if (typeof value === "number") {
    if (value < 0 || !Number.isInteger(value)) {
      diagnostics.push({
        message: `_retry must be a non-negative integer or an object with 'limit'`,
        range,
        severity: DiagnosticSeverity.Error,
      });
    }
    return;
  }

  if (typeof value === "object" && value !== null) {
    return; // accept object form
  }

  if (typeof value === "string") {
    return; // might be a variable reference
  }

  diagnostics.push({
    message: `_retry must be a non-negative integer or an object with 'limit', 'interval', and 'interval_type'`,
    range,
    severity: DiagnosticSeverity.Error,
  });
}
