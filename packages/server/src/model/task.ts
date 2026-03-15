import { Operator, Directive, ConfigEntry, LSPRange } from "./types";

export interface Task {
  name: string;
  range: LSPRange;
  operator?: Operator;
  operators: Operator[];
  directives: Directive[];
  subtasks: Task[];
  config: ConfigEntry[];
  hasParallel?: boolean;
  hasBackground?: boolean;
}
