import { Position } from "vscode-languageserver";
import { DigdagDocument } from "../model/digdagDocument";
import { Task } from "../model/task";

export function findTaskAtPosition(
  doc: DigdagDocument,
  position: Position
): Task | null {
  for (const task of doc.tasks) {
    const found = findTaskRecursive(task, position);
    if (found) return found;
  }
  return null;
}

function findTaskRecursive(task: Task, position: Position): Task | null {
  if (
    position.line >= task.range.start.line &&
    position.line <= task.range.end.line
  ) {
    // Check subtasks first (more specific)
    for (const sub of task.subtasks) {
      const found = findTaskRecursive(sub, position);
      if (found) return found;
    }
    return task;
  }
  return null;
}
