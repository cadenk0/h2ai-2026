import { usePatient } from "@/context/PatientContext";
import { UserRole } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Eye, Stethoscope } from "lucide-react";

const roleLabels: Record<UserRole, { label: string; icon: typeof User }> = {
  patient: { label: "Patient", icon: User },
  caregiver: { label: "Physical Therapist", icon: Eye },
  clinician: { label: "Clinician", icon: Stethoscope },
};

export function RoleSwitcher() {
  const { role, setRole } = usePatient();

  return (
    <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
      <SelectTrigger className="w-[140px] h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(roleLabels) as UserRole[]).map((r) => {
          const { label, icon: Icon } = roleLabels[r];
          return (
            <SelectItem key={r} value={r}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
