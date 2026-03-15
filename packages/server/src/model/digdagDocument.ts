import { Task } from "./task";
import {
  ValueWithRange,
  ScheduleBlock,
  DiagnosticInfo,
} from "./types";

export interface DigdagDocument {
  uri: string;
  timezone?: ValueWithRange<string>;
  schedule?: ScheduleBlock;
  tasks: Task[];
  globalExports?: Record<string, unknown>;
  yamlErrors: DiagnosticInfo[];
}
