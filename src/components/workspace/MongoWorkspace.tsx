import { useState } from "react";
import { FileCode2, Save, Play, RotateCcw, Search, MoreHorizontal, Database } from "lucide-react";

interface MongoWorkspaceProps {
  running: boolean;
  onRunQuery: () => void;
  code?: string;
  setCode?: (code: string) => void;
}

export function MongoWorkspace({ running, onRunQuery, code: externalCode, setCode: externalSetCode }: MongoWorkspaceProps) {
  const [internalCode, setInternalCode] = useState(
    `use college_lab\n\n// Create the Students collection\ndb.createCollection("Students")\n\n// Add your first document\ndb.Students.insertOne({\n  roll_no: "CS001",\n  name: "Arun",\n  department: "DSA",\n  semester: 5\n})`
  );

  const code = externalCode !== undefined ? externalCode : internalCode;
  const setCode = (val: string) => {
    if (externalSetCode) externalSetCode(val);
    else setInternalCode(val);
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      {/* Editor Sub-header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border-b-2 border-primary px-2 py-3 text-xs font-semibold text-foreground">
            <FileCode2 size={14} className="text-primary" /> solution.mongodb
            <span className="ml-2 size-1.5 rounded-full bg-chart-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-primary">
            <Database size={13} /> MongoDB Shell 7.0
          </span>
          <span className="mx-2 text-border">|</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Textarea code area */}
      <div className="labforge-scrollbar flex min-h-0 flex-1 overflow-auto">
        <div className="select-none border-r border-border px-3 pt-5 text-right text-xs leading-6 text-muted-foreground/50 font-mono">
          {code.split("\n").map((_, index) => (
            <div key={index}>{String(index + 1).padStart(2, "0")}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              onRunQuery();
            }
          }}
          spellCheck={false}
          aria-label="MongoDB code editor"
          className="labforge-mono min-h-[350px] flex-1 resize-none bg-transparent p-5 text-[13px] leading-6 text-accent-foreground outline-none"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-card/50 px-4 text-xs text-muted-foreground">
        <div>Ln {code.split("\n").length}, Col 1 · Javascript / MongoDB</div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunQuery}
            disabled={running}
            className="flex items-center gap-1.5 rounded bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 disabled:opacity-50"
          >
            {running ? <RotateCcw size={13} className="animate-spin" /> : <Play size={13} />}
            Execute Query
          </button>
        </div>
      </div>
    </section>
  );
}
