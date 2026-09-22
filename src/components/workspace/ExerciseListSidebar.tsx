import { Exercise } from "@/types/labforge";
import { Check, CircleDot, Clock3, Sparkles, Zap, BookOpen } from "lucide-react";

interface ExerciseListSidebarProps {
  labName: string;
  mandatoryExercises: Exercise[];
  aiGeneratedExercises: Exercise[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ExerciseListSidebar({
  labName,
  mandatoryExercises,
  aiGeneratedExercises,
  selectedId,
  onSelect,
}: ExerciseListSidebarProps) {
  const completedCount = [...mandatoryExercises, ...aiGeneratedExercises].filter(
    (e) => e.status === "passed"
  ).length;
  const totalCount = mandatoryExercises.length + aiGeneratedExercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <aside className="labforge-scrollbar flex w-[285px] shrink-0 flex-col border-r border-border bg-sidebar select-none">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            {labName}
          </div>
          <div className="mt-0.5 text-sm font-medium">Exercise Explorer</div>
        </div>
        <div className="rounded bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
          Sem V
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Lab Completion</span>
          <span className="text-foreground font-semibold">
            {completedCount} / {totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="labforge-scrollbar flex-1 overflow-y-auto p-3 space-y-4">
        {/* Mandatory Exercises Section */}
        <div>
          <div className="mb-2.5 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-primary" /> Mandatory Content
            </span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
              {mandatoryExercises.length}
            </span>
          </div>

          <div className="space-y-1">
            {mandatoryExercises.map((exercise, index) => (
              <ExerciseItemRow
                key={exercise.id}
                index={index + 1}
                exercise={exercise}
                isSelected={selectedId === exercise.id}
                onSelect={() => onSelect(exercise.id)}
              />
            ))}
          </div>
        </div>

        {/* AI Generated Extra Exercises Section */}
        <div>
          <div className="mb-2.5 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-chart-4">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-chart-4" /> AI Extra Practice
            </span>
            <span className="rounded bg-chart-4/15 px-1.5 py-0.5 text-[10px] font-bold text-chart-4">
              {aiGeneratedExercises.length}
            </span>
          </div>

          {aiGeneratedExercises.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
              No extra AI exercises generated yet. When faculty publishes mandatory tasks, AI automatically generates extra practice here!
            </div>
          ) : (
            <div className="space-y-1">
              {aiGeneratedExercises.map((exercise, index) => (
                <ExerciseItemRow
                  key={exercise.id}
                  index={index + 1}
                  exercise={exercise}
                  isSelected={selectedId === exercise.id}
                  onSelect={() => onSelect(exercise.id)}
                  isAi
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-auto border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md bg-secondary/60 p-3">
          <div className="flex size-7 items-center justify-center rounded bg-primary/15 text-primary shrink-0">
            <Zap size={14} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-foreground">Offline Learning Mode</div>
            <div className="text-[11px] text-muted-foreground">Local laboratory workspace</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ExerciseItemRow({
  index,
  exercise,
  isSelected,
  onSelect,
  isAi = false,
}: {
  index: number;
  exercise: Exercise;
  isSelected: boolean;
  onSelect: () => void;
  isAi?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? isAi
            ? "border-chart-4/50 bg-chart-4/10 shadow-sm"
            : "border-primary/50 bg-primary/10 shadow-sm"
          : "border-transparent hover:bg-secondary/70"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
            exercise.status === "passed"
              ? "bg-primary/20 text-primary font-bold"
              : exercise.status === "in-progress"
              ? "bg-chart-3/20 text-chart-3 font-bold"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {exercise.status === "passed" ? (
            <Check size={11} />
          ) : exercise.status === "in-progress" ? (
            <CircleDot size={11} />
          ) : (
            <Clock3 size={11} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`truncate text-xs leading-4 ${
                isSelected ? "font-semibold text-foreground" : "text-secondary-foreground"
              }`}
            >
              {index}. {exercise.title}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="rounded bg-secondary px-1.5 py-0.2">{exercise.difficulty}</span>
            <span>·</span>
            <span>{exercise.timeEstimate}</span>
            {isAi && (
              <>
                <span>·</span>
                <span className="text-chart-4 font-medium">AI Generated</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
