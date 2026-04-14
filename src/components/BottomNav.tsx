import { Home, Mic, ClipboardList, HelpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Mic, label: "Check-In", path: "/checkin" },
  { icon: ClipboardList, label: "My Logs", path: "/logs" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
