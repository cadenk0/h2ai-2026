import { subDays, format } from "date-fns";

export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type CompanionType = "plant" | "pet";
export type UserRole = "patient" | "caregiver" | "clinician";
export type ReminderFrequency = "once" | "every2hours";
export type AIPersona = "warm-elder" | "friendly-adult" | "clinical";

export interface DailyLog {
  date: string;
  painLevel: PainLevel;
  medicationTaken: boolean;
  steps: number;
  gaitSymmetry: number; // 0-100%
  motionEvents: number;
  checkInCompleted: boolean;
  checkInSummary?: string;
  sentimentScore?: number; // -1 to 1
  fallDetected: boolean;
}

export interface PatientSettings {
  name: string;
  companionType: CompanionType;
  wakeUpHour: number; // 0-23
  bedtimeHour: number; // 0-23
  remindersEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  onboardingComplete: boolean;
  aiPersona: AIPersona;
  caregiverVisitDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface AlarmState {
  active: boolean;
  triggeredAt: string | null; // ISO date
  reason: string;
  sentToClinician: boolean;
  sentAt: string | null;
}

export interface MedicationEntry {
  name: string;
  dosage: string;
  times: string[];
  taken: boolean[];
}

export const defaultSettings: PatientSettings = {
  name: "",
  companionType: "plant",
  wakeUpHour: 8,
  bedtimeHour: 21,
  remindersEnabled: true,
  reminderFrequency: "every2hours",
  onboardingComplete: false,
  aiPersona: "warm-elder",
  caregiverVisitDays: [1, 3, 5], // Mon, Wed, Fri default
};

export const defaultAlarmState: AlarmState = {
  active: false,
  triggeredAt: null,
  reason: "",
  sentToClinician: false,
  sentAt: null,
};

const today = new Date();

export const mockDailyLogs: DailyLog[] = Array.from({ length: 14 }, (_, i) => {
  const daysAgo = 13 - i;
  const date = subDays(today, daysAgo);
  const improving = Math.max(0, Math.round(8 - i * 0.6)) as PainLevel;
  return {
    date: format(date, "yyyy-MM-dd"),
    painLevel: improving,
    medicationTaken: Math.random() > 0.15,
    steps: Math.floor(2000 + i * 300 + Math.random() * 500),
    gaitSymmetry: Math.min(95, 65 + i * 2 + Math.floor(Math.random() * 5)),
    motionEvents: Math.floor(8 + i * 0.5 + Math.random() * 3),
    checkInCompleted: i < 13 ? Math.random() > 0.1 : false, // today not done yet
    checkInSummary: i < 13
      ? [
          "Feeling a bit stiff this morning but better after walking.",
          "Good day overall. Knee felt strong during exercises.",
          "Some pain in the afternoon. Took extra rest.",
          "Best day yet! Walked to the mailbox and back.",
          "Tired but managing. Sleeping better now.",
        ][i % 5]
      : undefined,
    sentimentScore: i < 13 ? 0.2 + i * 0.05 + Math.random() * 0.2 : undefined,
    fallDetected: i === 3,
  };
});

export const mockMedications: MedicationEntry[] = [
  { name: "Ibuprofen", dosage: "400mg", times: ["8:00 AM", "2:00 PM", "8:00 PM"], taken: [true, true, false] },
  { name: "Physical Therapy Exercises", dosage: "30 min", times: ["10:00 AM"], taken: [true] },
  { name: "Calcium Supplement", dosage: "500mg", times: ["8:00 AM"], taken: [true] },
];

export const checkInQuestions = [
  { id: "pain", question: "How's your pain today?", type: "scale" as const },
  { id: "medication", question: "Did you take all your medications?", type: "yesno" as const },
  { id: "falls", question: "Any falls or stumbles today?", type: "yesno" as const },
  { id: "voice", question: "Tell us how you're feeling today", type: "voice" as const },
];

export function getStreak(logs: DailyLog[]): number {
  let streak = 0;
  for (let i = logs.length - 2; i >= 0; i--) {
    if (logs[i].checkInCompleted) streak++;
    else break;
  }
  return streak;
}

export function getCompanionMood(streak: number): "sad" | "neutral" | "happy" | "thriving" {
  if (streak === 0) return "sad";
  if (streak <= 2) return "neutral";
  if (streak <= 5) return "happy";
  return "thriving";
}

export function getReminderUrgency(currentHour: number, bedtimeHour: number): "gentle" | "moderate" | "urgent" {
  const hoursUntilBed = bedtimeHour - currentHour;
  if (hoursUntilBed <= 2) return "urgent";
  if (hoursUntilBed <= 5) return "moderate";
  return "gentle";
}
