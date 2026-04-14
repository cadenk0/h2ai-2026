import { usePatient } from "@/context/PatientContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

const messages = {
  gentle: {
    text: "Good morning! Your companion is waiting for today's check-in.",
    bg: "bg-primary/10 border-primary/20",
  },
  moderate: {
    text: "Your companion is getting a little lonely. Time to check in?",
    bg: "bg-accent/30 border-accent/40",
  },
  urgent: {
    text: "Last chance today — keep your streak going!",
    bg: "bg-destructive/10 border-destructive/20",
  },
};

export function ReminderBanner() {
  const { shouldShowReminder, reminderUrgency } = usePatient();
  const navigate = useNavigate();

  if (!shouldShowReminder) return null;

  const { text, bg } = messages[reminderUrgency];

  return (
    <div className={`rounded-2xl border p-4 ${bg} transition-all duration-500`}>
      <p className="text-base font-medium mb-3">{text}</p>
      <Button
        onClick={() => navigate("/checkin")}
        size="lg"
        className="w-full text-lg rounded-xl h-12"
      >
        <Mic className="h-5 w-5 mr-2" />
        Check In Now
      </Button>
    </div>
  );
}
