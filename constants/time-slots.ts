export const TIME_SLOTS = [
  "Morning (06:00–12:00)",
  "Afternoon (12:00–17:00)",
  "Evening (17:00–21:00)",
  "Night (21:00–23:00)",
] as const;

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
