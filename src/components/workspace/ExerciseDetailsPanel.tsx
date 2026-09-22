import { Exercise } from "@/types/labforge";
import { X, Sparkles, Lightbulb, CheckCircle2, Send, HelpCircle, Code, ListChecks } from "lucide-react";

interface ExerciseDetailsPanelProps {
  exercise: Exercise;
  onClose: () => void;
  onSubmitSolution?: () => void;
}

export function ExerciseDetailsPanel({ exercise, onClose, onSubmitSolution }: ExerciseDetailsPanelProps) {
  return (
    <section className="labforge-scrollbar flex w-[320px] shrink-0 flex-col border-r border-border bg-card/40 select-none">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Exercise Spec
            </span>
            {exercise.isAiGenerated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-semibold text-chart-4">
                <Sparkles size={11} /> AI Practice
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <h2 className="labforge-display mt-2 text-lg font-bold leading-6 text-foreground">
          {exercise.title}
        </h2>

        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="rounded bg-primary/15 px-2 py-0.5 font-medium text-primary">
            {exercise.difficulty}
          </span>
          <span className="text-muted-foreground">{exercise.topic}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">{exercise.timeEstimate}</span>
        </div>
      </div>

      {/* Body / Sections */}
      <div className="labforge-scrollbar flex-1 overflow-y-auto p-5 text-sm space-y-6">
        {/* Question & Description */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <HelpCircle size={13} className="text-primary" /> Question & Overview
          </h3>
          <div className="rounded-md border border-border/80 bg-background/50 p-3 leading-6 text-foreground font-medium text-xs">
            {exercise.question}
          </div>
          <p className="mt-3 leading-6 text-muted-foreground text-xs">{exercise.description}</p>
        </div>

        {/* Learning Objective */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Learning Objective
          </h3>
          <p className="rounded-md border border-border/60 bg-secondary/30 p-3 text-xs leading-5 text-secondary-foreground">
            {exercise.learningObjective}
          </p>
        </div>

        {/* Examples */}
        {exercise.examples && exercise.examples.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code size={13} className="text-chart-2" /> Examples
            </h3>
            {exercise.examples.map((example, idx) => (
              <div key={idx} className="space-y-2 mb-3 last:mb-0">
                <div className="text-[11px] font-semibold text-muted-foreground">Input:</div>
                <pre className="labforge-mono overflow-x-auto rounded-md border border-border bg-background p-2.5 text-xs text-accent-foreground">
                  {example.input}
                </pre>
                <div className="text-[11px] font-semibold text-muted-foreground">Expected Output:</div>
                <pre className="labforge-mono overflow-x-auto rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs text-primary font-medium">
                  {example.output}
                </pre>
                {example.explanation && (
                  <p className="text-[11px] italic text-muted-foreground">{example.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {exercise.constraints && (
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Constraints & Requirements
            </h3>
            <div className="rounded-md border border-border/70 bg-background p-3 text-xs text-muted-foreground leading-5">
              {exercise.constraints}
            </div>
          </div>
        )}

        {/* Test Cases Info */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ListChecks size={13} className="text-chart-4" /> Test Information
          </h3>
          <div className="rounded-md border border-border/70 bg-card p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total Test Cases:</span>
              <span className="font-semibold text-foreground">{exercise.testCases.length}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Execution Mode:</span>
              <span className="font-semibold text-primary">Automated Validation</span>
            </div>
          </div>
        </div>

        {/* Hints */}
        {exercise.hints && exercise.hints.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lightbulb size={13} className="text-chart-3" /> Hints & Guidance
            </h3>
            <div className="rounded-md border border-chart-3/30 bg-chart-3/10 p-3 text-xs leading-5 text-chart-3 space-y-2">
              {exercise.hints.map((hint, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Submission Button */}
      <div className="border-t border-border p-4">
        <button
          onClick={onSubmitSolution}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-105 transition-all shadow-sm"
        >
          <Send size={14} /> Submit Final Solution
        </button>
      </div>
    </section>
  );
}
