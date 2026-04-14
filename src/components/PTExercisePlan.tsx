import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kneeRehabExercises, phaseLabels, categoryLabels, PTExercise } from "@/data/ptExercises";
import { ChevronDown, ChevronUp, Dumbbell, Trophy } from "lucide-react";
import { format } from "date-fns";

const STORAGE_KEY = "pt-exercise-progress";

interface ExerciseProgress {
  [date: string]: string[]; // date -> completed exercise IDs
}

function getProgress(): ExerciseProgress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(progress: ExerciseProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

const categoryColors: Record<PTExercise["category"], string> = {
  rom: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  strengthening: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  balance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  functional: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  stretching: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

interface Props {
  compact?: boolean;
}

export function PTExercisePlan({ compact = false }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PTExercise["phase"]>("early");

  useEffect(() => {
    const progress = getProgress();
    setCompletedIds(progress[today] || []);
  }, [today]);

  const toggleExercise = (id: string) => {
    const progress = getProgress();
    const todayCompleted = progress[today] || [];
    const updated = todayCompleted.includes(id)
      ? todayCompleted.filter((eid) => eid !== id)
      : [...todayCompleted, id];
    progress[today] = updated;
    saveProgress(progress);
    setCompletedIds(updated);
  };

  const phaseExercises = kneeRehabExercises.filter((e) => e.phase === selectedPhase);
  const completedCount = phaseExercises.filter((e) => completedIds.includes(e.id)).length;
  const totalCount = phaseExercises.length;
  const allDone = completedCount === totalCount && totalCount > 0;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (compact) {
    const allExercises = kneeRehabExercises;
    const todayDone = allExercises.filter((e) => completedIds.includes(e.id)).length;
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">PT Exercises</p>
                <p className="text-[11px] text-muted-foreground">
                  {todayDone}/{allExercises.length} completed today
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold tabular-nums">
                {Math.round((todayDone / allExercises.length) * 100)}%
              </p>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(todayDone / allExercises.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Knee Rehab Exercises
        </h2>
        {allDone && (
          <Badge className="bg-success/15 text-success border-0 gap-1">
            <Trophy className="h-3 w-3" /> All done!
          </Badge>
        )}
      </div>

      {/* Phase selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["early", "mid", "late"] as const).map((phase) => (
          <Button
            key={phase}
            variant={selectedPhase === phase ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPhase(phase)}
            className="rounded-xl text-xs whitespace-nowrap shrink-0"
          >
            {phase === "early" ? "Weeks 1-2" : phase === "mid" ? "Weeks 3-6" : "Weeks 7-12"}
          </Button>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{phaseLabels[selectedPhase]}</span>
          <span className="font-medium">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        {phaseExercises.map((exercise) => {
          const isDone = completedIds.includes(exercise.id);
          const isExpanded = expandedId === exercise.id;

          return (
            <Card
              key={exercise.id}
              className={`border shadow-sm transition-all ${isDone ? "bg-success/5 border-success/20" : ""}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-3 p-3.5">
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => toggleExercise(exercise.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {exercise.name}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${categoryColors[exercise.category]}`}>
                        {categoryLabels[exercise.category]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{exercise.description}</p>
                    <p className="text-xs text-foreground/70 mt-1 font-medium">
                      {exercise.sets} sets × {exercise.reps}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                    className="p-1 rounded-md hover:bg-secondary transition-colors shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-0 ml-9">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Instructions</p>
                      <ol className="space-y-1">
                        {exercise.instructions.map((step, i) => (
                          <li key={i} className="text-xs text-foreground/80 flex gap-2">
                            <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
