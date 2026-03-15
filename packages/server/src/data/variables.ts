export interface VariableDef {
  name: string;
  description: string;
  example?: string;
}

export const BUILTIN_VARIABLES: VariableDef[] = [
  {
    name: "session_time",
    description: "Session time in `yyyy-MM-dd HH:mm:ss` format.",
    example: "2024-01-15 00:00:00",
  },
  {
    name: "session_date",
    description: "Session date in `yyyy-MM-dd` format.",
    example: "2024-01-15",
  },
  {
    name: "session_date_compact",
    description: "Session date in `yyyyMMdd` format.",
    example: "20240115",
  },
  {
    name: "session_local_time",
    description: "Session time in the workflow's timezone.",
    example: "2024-01-15 09:00:00",
  },
  {
    name: "session_tz_offset",
    description: "Timezone offset string.",
    example: "+09:00",
  },
  {
    name: "session_unixtime",
    description: "Session time as Unix timestamp (seconds).",
    example: "1705276800",
  },
  {
    name: "session_id",
    description: "Unique session ID.",
    example: "12345",
  },
  {
    name: "attempt_id",
    description: "Unique attempt ID.",
    example: "67890",
  },
  {
    name: "task_name",
    description: "Full task name path.",
    example: "+my_workflow+load_data",
  },
  {
    name: "project_id",
    description: "Project ID.",
    example: "42",
  },
  {
    name: "project_name",
    description: "Project name.",
    example: "my_project",
  },
  {
    name: "workflow_name",
    description: "Workflow definition name.",
    example: "my_workflow",
  },
  {
    name: "revision_name",
    description: "Project revision name.",
    example: "rev-2024-01-15",
  },
  {
    name: "timezone",
    description: "Workflow timezone.",
    example: "Asia/Tokyo",
  },
  {
    name: "last_session_time",
    description: "Previous session's time.",
    example: "2024-01-14 00:00:00",
  },
  {
    name: "last_session_date",
    description: "Previous session's date.",
    example: "2024-01-14",
  },
  {
    name: "last_session_date_compact",
    description: "Previous session's date in `yyyyMMdd` format.",
    example: "20240114",
  },
  {
    name: "last_session_local_time",
    description: "Previous session time in the workflow's timezone.",
    example: "2024-01-14 09:00:00",
  },
  {
    name: "last_session_tz_offset",
    description: "Previous session's timezone offset.",
    example: "+09:00",
  },
  {
    name: "last_session_unixtime",
    description: "Previous session time as Unix timestamp.",
    example: "1705190400",
  },
  {
    name: "next_session_time",
    description: "Next session's time.",
    example: "2024-01-16 00:00:00",
  },
  {
    name: "next_session_date",
    description: "Next session's date.",
    example: "2024-01-16",
  },
  {
    name: "next_session_date_compact",
    description: "Next session's date in `yyyyMMdd` format.",
    example: "20240116",
  },
  {
    name: "next_session_local_time",
    description: "Next session time in the workflow's timezone.",
    example: "2024-01-16 09:00:00",
  },
  {
    name: "next_session_tz_offset",
    description: "Next session's timezone offset.",
    example: "+09:00",
  },
  {
    name: "next_session_unixtime",
    description: "Next session time as Unix timestamp.",
    example: "1705363200",
  },
  {
    name: "moment",
    description: "Java Moment-like time utility for date manipulation.",
    example: "${moment(session_time).format('yyyy')}",
  },
  {
    name: "http",
    description: "HTTP utility for making requests in variable expressions.",
    example: '${http.get("https://example.com")}',
  },
];

const variableMap = new Map<string, VariableDef>();
for (const v of BUILTIN_VARIABLES) {
  variableMap.set(v.name, v);
}

export function getVariable(name: string): VariableDef | undefined {
  return variableMap.get(name);
}
