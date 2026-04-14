import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/context/PatientContext";
import {
  ClinicalSummary,
  generateClinicalSummary,
} from "@/utils/generateClinicalSummary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Send,
  Brain,
  Loader2,
} from "lucide-react";

interface Props {
  variant?: "caregiver" | "clinician";
}

const severityColors = {
  mild: "bg-yellow-100 text-yellow-800 border-yellow-300",
  moderate: "bg-orange-100 text-orange-800 border-orange-300",
  severe: "bg-red-100 text-red-800 border-red-300",
};

const statusConfig = {
  good: { icon: CheckCircle, label: "Good", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  concerning: { icon: AlertTriangle, label: "Concerning", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  critical: { icon: AlertTriangle, label: "Critical", color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

const trendIcons = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

export function ClinicalSummaryCard({ variant = "clinician" }: Props) {
  const { logs, settings, role } = usePatient();
  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    generateClinicalSummary(logs).then((s) => {
      if (!cancelled) {
        setSummary(s);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [logs]);

  const handleSendToCareTeam = async () => {
    if (!summary) return;
    setSending(true);
    try {
      const { error } = await supabase.from("care_team_alerts").insert({
        patient_name: settings.name || "Patient",
        summary_text: summary.narrativeSummary,
        findings: summary.findings as any,
        voice_insights: summary.voiceInsights as any,
        overall_status: summary.overallStatus,
        sent_by_role: role,
      });
      if (error) throw error;
      toast.success("Summary sent to care team!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send summary");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Generating clinical summary...</span>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const StatusIcon = statusConfig[summary.overallStatus].icon;
  const statusCfg = statusConfig[summary.overallStatus];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Clinical Summary
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendToCareTeam}
            disabled={sending}
            className="gap-1.5"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send to Care Team
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${statusCfg.bg}`}>
          <StatusIcon className={`h-5 w-5 ${statusCfg.color}`} />
          <span className={`font-semibold ${statusCfg.color}`}>
            Overall Status: {statusCfg.label}
          </span>
        </div>

        {/* Findings */}
        {summary.findings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Findings</h4>
            {summary.findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge className={`shrink-0 text-xs border ${severityColors[f.severity]}`}>
                  {f.severity}
                </Badge>
                <div>
                  <span className="text-sm font-medium">{f.metric}</span>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {summary.findings.length === 0 && (
          <p className="text-sm text-muted-foreground">All metrics within normal ranges.</p>
        )}

        {/* Voice Insights */}
        {summary.voiceInsights && (
          <div className="space-y-3 border-t border-border pt-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              🎤 Patient Voice Insights
            </h4>

            {/* Emotional trend */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Emotional trend:</span>
              {(() => {
                const TrendIcon = trendIcons[summary.voiceInsights!.emotionalTrend];
                const trendColor = summary.voiceInsights!.emotionalTrend === "improving"
                  ? "text-green-600"
                  : summary.voiceInsights!.emotionalTrend === "declining"
                  ? "text-red-600"
                  : "text-muted-foreground";
                return (
                  <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    {summary.voiceInsights!.emotionalTrend}
                  </span>
                );
              })()}
            </div>

            {/* Themes */}
            {summary.voiceInsights.dominantThemes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {summary.voiceInsights.dominantThemes.map((theme, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}

            {/* Concern keywords */}
            {summary.voiceInsights.concernKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Concerns:</span>
                {summary.voiceInsights.concernKeywords.map((kw, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}

            {/* Narrative */}
            {variant === "clinician" && summary.voiceInsights.narrativeSummary && (
              <p className="text-sm text-muted-foreground italic">
                "{summary.voiceInsights.narrativeSummary}"
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
