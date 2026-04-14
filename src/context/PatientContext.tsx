import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  PatientSettings,
  DailyLog,
  MedicationEntry,
  UserRole,
  AlarmState,
  defaultSettings,
  defaultAlarmState,
  mockDailyLogs,
  mockMedications,
  getStreak,
  getCompanionMood,
  getReminderUrgency,
  CompanionType,
  PainLevel,
  ReminderFrequency,
} from "@/data/mockData";
import { format, parseISO, addDays, isAfter, getDay } from "date-fns";
import { toast } from "sonner";

interface PatientContextType {
  settings: PatientSettings;
  updateSettings: (s: Partial<PatientSettings>) => void;
  logs: DailyLog[];
  medications: MedicationEntry[];
  streak: number;
  companionMood: "sad" | "neutral" | "happy" | "thriving";
  hasCheckedInToday: boolean;
  completeCheckIn: (painLevel: PainLevel, medsTaken: boolean, falls: boolean, summary: string) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  currentHour: number;
  reminderUrgency: "gentle" | "moderate" | "urgent";
  shouldShowReminder: boolean;
  alarm: AlarmState;
  triggerAlarm: (reason: string) => void;
  resetAlarm: () => boolean; // returns false if role can't reset
}

const PatientContext = createContext<PatientContextType | null>(null);

function getNextCaregiverVisit(visitDays: number[] | undefined, fromDate: Date): Date {
  const days = visitDays ?? defaultSettings.caregiverVisitDays ?? [];
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = addDays(fromDate, offset);
    if (days.includes(getDay(candidate))) {
      return candidate;
    }
  }
  return addDays(fromDate, 7);
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PatientSettings>(() => {
    const saved = localStorage.getItem("rc-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [logs, setLogs] = useState<DailyLog[]>(mockDailyLogs);
  const [medications] = useState<MedicationEntry[]>(mockMedications);
  const [role, setRole] = useState<UserRole>("patient");
  const [currentHour] = useState(() => new Date().getHours());
  const [alarm, setAlarm] = useState<AlarmState>(() => {
    const saved = localStorage.getItem("rc-alarm");
    return saved ? JSON.parse(saved) : defaultAlarmState;
  });

  useEffect(() => {
    localStorage.setItem("rc-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("rc-alarm", JSON.stringify(alarm));
  }, [alarm]);

  const updateSettings = useCallback((partial: Partial<PatientSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find((l) => l.date === todayStr);
  const hasCheckedInToday = todayLog?.checkInCompleted ?? false;

  const streak = getStreak(logs);
  const companionMood = getCompanionMood(streak + (hasCheckedInToday ? 1 : 0));
  const reminderUrgency = getReminderUrgency(currentHour, settings.bedtimeHour);

  const shouldShowReminder =
    !hasCheckedInToday &&
    settings.remindersEnabled &&
    currentHour >= settings.wakeUpHour &&
    currentHour < settings.bedtimeHour;

  const triggerAlarm = useCallback((reason: string) => {
    setAlarm((prev) => {
      if (prev.active) return prev;
      return {
        active: true,
        triggeredAt: new Date().toISOString(),
        reason,
        sentToClinician: false,
        sentAt: null,
      };
    });
  }, []);

  const resetAlarm = useCallback(() => {
    if (role === "patient") {
      toast.error("Only your physical therapist or clinician can reset this alarm.");
      return false;
    }
    setAlarm(defaultAlarmState);
    toast.success("Alarm has been reset.");
    return true;
  }, [role]);

  // Auto-send to clinician: 1 day after next physical therapist visit
  useEffect(() => {
    if (!alarm.active || alarm.sentToClinician || !alarm.triggeredAt) return;
    
    const triggeredDate = parseISO(alarm.triggeredAt);
    const nextVisit = getNextCaregiverVisit(settings.caregiverVisitDays, triggeredDate);
    const sendDate = addDays(nextVisit, 1);
    const now = new Date();
    
    if (isAfter(now, sendDate)) {
      setAlarm((prev) => ({
        ...prev,
        sentToClinician: true,
        sentAt: now.toISOString(),
      }));
      toast.warning("Alarm has been automatically sent to the clinician.", {
        duration: 8000,
      });
    }
  }, [alarm, settings.caregiverVisitDays]);

  // Check for concerning patterns from logs
  useEffect(() => {
    if (alarm.active) return;
    const last7 = logs.slice(-7);
    if (last7.length < 3) return;

    const avgPain = last7.reduce((a, l) => a + l.painLevel, 0) / last7.length;
    const falls = last7.filter((l) => l.fallDetected).length;
    const missedMeds = last7.filter((l) => !l.medicationTaken).length;

    if (avgPain >= 7) {
      triggerAlarm(`High average pain level (${avgPain.toFixed(1)}/10) over the last 7 days`);
    } else if (falls >= 2) {
      triggerAlarm(`${falls} falls detected in the last 7 days`);
    } else if (missedMeds >= 4) {
      triggerAlarm(`${missedMeds} days with missed medications in the last 7 days`);
    }
  }, [logs, alarm.active, triggerAlarm]);

  const completeCheckIn = useCallback(
    (painLevel: PainLevel, medsTaken: boolean, falls: boolean, summary: string) => {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.date === todayStr);
        const newLog: DailyLog = {
          date: todayStr,
          painLevel,
          medicationTaken: medsTaken,
          steps: todayLog?.steps ?? Math.floor(2000 + Math.random() * 2000),
          gaitSymmetry: todayLog?.gaitSymmetry ?? 82,
          motionEvents: todayLog?.motionEvents ?? 10,
          checkInCompleted: true,
          checkInSummary: summary,
          sentimentScore: 0.5 + Math.random() * 0.3,
          fallDetected: falls,
        };
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newLog;
          return copy;
        }
        return [...prev, newLog];
      });
      toast.success("Check-in complete! Your companion is happy 🌿");
    },
    [todayStr, todayLog]
  );

  // Show reminder toast on mount if needed
  useEffect(() => {
    if (shouldShowReminder && settings.onboardingComplete) {
      const timer = setTimeout(() => {
        toast("Hey! Don't forget to check in today 🌱", {
          description: "Your companion is waiting for you!",
          duration: 6000,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowReminder, settings.onboardingComplete]);

  return (
    <PatientContext.Provider
      value={{
        settings,
        updateSettings,
        logs,
        medications,
        streak,
        companionMood,
        hasCheckedInToday,
        completeCheckIn,
        role,
        setRole,
        currentHour,
        reminderUrgency,
        shouldShowReminder,
        alarm,
        triggerAlarm,
        resetAlarm,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be inside PatientProvider");
  return ctx;
}
