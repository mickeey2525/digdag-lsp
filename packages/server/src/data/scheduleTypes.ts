export interface ScheduleTypeDef {
  name: string;
  description: string;
  params?: string;
  example?: string;
}

export const SCHEDULE_TYPES: ScheduleTypeDef[] = [
  {
    name: "daily>",
    description: "Runs once per day at the specified time.",
    params: "HH:MM:SS",
    example: "daily>: 07:00:00",
  },
  {
    name: "hourly>",
    description: "Runs once per hour at the specified minute.",
    params: "MM:SS",
    example: "hourly>: 30:00",
  },
  {
    name: "weekly>",
    description: "Runs once per week on the specified day and time.",
    params: "DAY,HH:MM:SS",
    example: "weekly>: Mon,07:00:00",
  },
  {
    name: "monthly>",
    description: "Runs once per month on the specified day and time.",
    params: "D,HH:MM:SS",
    example: "monthly>: 1,07:00:00",
  },
  {
    name: "minutes_interval>",
    description: "Runs at fixed minute intervals.",
    params: "integer (minutes)",
    example: "minutes_interval>: 15",
  },
  {
    name: "cron>",
    description: "Runs on a cron schedule expression.",
    params: "cron expression string",
    example: "cron>: '0 */2 * * *'",
  },
];
