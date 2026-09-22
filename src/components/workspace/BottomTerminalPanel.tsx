import { useState } from "react";
import { CircleCheck, CircleX, Terminal, Output, AlertTriangle, X } from "lucide-react";
import { ExecutionResult } from "@/types/labforge";

interface BottomTerminalPanelProps {
  running: boolean;
  lastResult: ExecutionResult | null;
  technology: string;
}

export function BottomTerminalPanel({ running, lastResult, technology }: BottomTerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<"Terminal" | "Output" | "Problems" | "Test Results">("Terminal");

  const tabs: Array<"Terminal" | "Output" | "Problems" | "Test Results"> = [
    "Terminal",
    "Output",
    "Problems",
    "Test Results",
  ];

  return (
    <div className="h-44 shrink-0 border-t border-border bg-sidebar select-none">
      {/* Tab Navigation */}
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="flex h-full items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex h-full items-center border-b-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "Problems" && (
                <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {lastResult?.exitCode !== undefined && lastResult.exitCode !== 0 ? 1 : 0}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{technology} Runner</span>
        </div>
      </div>

      {/* Tab Content Window */}
      <div className="labforge-mono h-[calc(176px-40px)] overflow-y-auto p-4 text-xs leading-6 text-muted-foreground">
        {activeTab === "Terminal" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <span>➜</span>
              <span className="font-semibold">labforge-shell</span>
              <span className="text-muted-foreground">[{technology}]</span>
            </div>
            <div>
              {running ? (
                <span className="text-chart-3 animate-pulse">Running execution engine...</span>
              ) : (
                <span className="text-primary font-medium">✓ Engine ready for commands.</span>
              )}
            </div>
            {lastResult && (
              <div className="mt-2 text-accent-foreground">
                Last execution completed in {lastResult.executionTimeMs}ms with exit code {lastResult.exitCode}.
              </div>
            )}
            <div className="mt-1 flex items-center gap-1">
              <span className="text-primary">➜</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        )}

        {activeTab === "Output" && (
          <div>
            {running ? (
              <div className="text-chart-3">Executing code... Please wait.</div>
            ) : lastResult ? (
              <div className="space-y-2">
                <div className={`font-semibold ${lastResult.exitCode === 0 ? "text-primary" : "text-destructive"}`}>
                  {lastResult.exitCode === 0 ? "✓ Execution Completed Successfully" : "✗ Execution Failed"}
                </div>
                {lastResult.stdout && (
                  <pre className="whitespace-pre-wrap text-foreground bg-background/50 p-2 rounded border border-border">
                    {lastResult.stdout}
                  </pre>
                )}
                {lastResult.stderr && (
                  <pre className="whitespace-pre-wrap text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                    {lastResult.stderr}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No output generated yet. Click "Run Code" to execute.</div>
            )}
          </div>
        )}

        {activeTab === "Problems" && (
          <div>
            {lastResult?.stderr ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={15} /> Error found: {lastResult.stderr.slice(0, 100)}...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-primary">
                <CircleCheck size={15} /> No syntax or compilation errors detected.
              </div>
            )}
          </div>
        )}

        {activeTab === "Test Results" && (
          <div>
            {lastResult?.testResults ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CircleCheck size={15} />{" "}
                  {lastResult.testResults.filter((t) => t.passed).length} / {lastResult.testResults.length} Test Cases Passed
                </div>
                {lastResult.testResults.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border">
                    <span className="font-mono">Test Case #{idx + 1} ({t.testCaseId})</span>
                    <span className={t.passed ? "text-primary font-bold" : "text-destructive font-bold"}>
                      {t.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">Run your code to view test case pass/fail verification results.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
