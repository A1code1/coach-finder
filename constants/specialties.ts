export const SPECIALTIES = [
  "Goalkeeping",
  "Technique",
  "Tactics",
  "Fitness",
  "1-on-1 drills",
  "Youth development",
  "Passing",
  "Shooting",
  "Positional training",
] as const;

export const AGE_GROUPS = ["kids", "teens", "adults"] as const;

export type Specialty = (typeof SPECIALTIES)[number];
export type AgeGroup = (typeof AGE_GROUPS)[number];
