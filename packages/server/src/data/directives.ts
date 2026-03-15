export interface DirectiveDef {
  name: string;
  description: string;
  validValues?: string;
}

export const DIRECTIVES: DirectiveDef[] = [
  {
    name: "_retry",
    description:
      "Configures automatic retry on failure. Can be a number (max retries) or an object with `limit`, `interval`, and `interval_type`.",
    validValues: "integer | { limit: int, interval: int, interval_type: constant|exponential }",
  },
  {
    name: "_error",
    description: "Defines a subtask to run when this task fails.",
  },
  {
    name: "_check",
    description:
      "Defines a subtask to run after the main task succeeds, used to verify results.",
  },
  {
    name: "_parallel",
    description: "When true, runs all subtasks in parallel.",
    validValues: "true | false",
  },
  {
    name: "_background",
    description:
      "When true, runs this task in the background (non-blocking).",
    validValues: "true | false",
  },
  {
    name: "_after",
    description:
      "Specifies task dependencies within a parallel group. Only valid when parent has `_parallel: true`.",
    validValues: "string | string[]",
  },
  {
    name: "_export",
    description:
      "Exports variables to child tasks or the global scope.",
  },
  {
    name: "_store",
    description: "Stores variables to be passed to downstream tasks.",
  },
  {
    name: "_env",
    description: "Sets environment variables for shell commands in this task.",
  },
  {
    name: "_do",
    description: "Defines subtasks for loop/for_each/if operators.",
  },
  {
    name: "_else_do",
    description:
      "Defines subtasks to run when the `if>` condition is false.",
  },
  {
    name: "_sla",
    description: "Defines SLA (Service Level Agreement) rules for the task.",
  },
];

const directiveMap = new Map<string, DirectiveDef>();
for (const d of DIRECTIVES) {
  directiveMap.set(d.name, d);
}

export function getDirective(name: string): DirectiveDef | undefined {
  return directiveMap.get(name);
}

export function isKnownDirective(name: string): boolean {
  if (!name.startsWith("_")) return false;
  return directiveMap.has(name);
}
