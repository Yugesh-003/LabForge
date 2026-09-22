import { useState } from "react";
import { Play, Plus, Trash2, CheckCircle2, RotateCcw, FileText, Code2, Sparkles } from "lucide-react";

interface Cell {
  id: string;
  type: "code" | "markdown";
  content: string;
  output?: string;
  executionCount?: number;
  executedAt?: string;
}

interface JupyterWorkspaceProps {
  running: boolean;
  onRunNotebook: (code?: string) => void;
}

export function JupyterWorkspace({ running, onRunNotebook }: JupyterWorkspaceProps) {
  const [cells, setCells] = useState<Cell[]>([
    {
      id: "c1",
      type: "markdown",
      content: "### NLP Lab: Tokenization & Stop-word Removal\nThis interactive Jupyter notebook demonstrates text cleaning and normalization using Python.",
    },
    {
      id: "c2",
      type: "code",
      executionCount: 1,
      content: `import re\n\nstop_words = {"a", "an", "the", "in", "on", "and", "is", "for", "to"}\n\ndef clean_tokens(text: str):\n    # Lowercase & strip punctuation\n    clean_text = re.sub(r'[^\\w\\s]', '', text.lower())\n    tokens = clean_text.split()\n    return [word for word in tokens if word not in stop_words]\n\nsample_text = "LabForge makes laboratory learning seamless and interactive!"\nprint("Tokens:", clean_tokens(sample_text))`,
      output: "Tokens: ['labforge', 'makes', 'laboratory', 'learning', 'seamless', 'interactive']",
    },
    {
      id: "c3",
      type: "code",
      executionCount: 2,
      content: `# Exercise 02: Calculate vocabulary length\nvocab = set(clean_tokens(sample_text))\nprint("Unique vocabulary size:", len(vocab))`,
      output: "Unique vocabulary size: 6",
    }
  ]);

  const updateCellContent = (id: string, text: string) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: text } : c))
    );
  };

  const addCell = (type: "code" | "markdown") => {
    const newCell: Cell = {
      id: `c-${Date.now()}`,
      type,
      content: type === "code" ? "# Write your python code here" : "### Note",
    };
    setCells((prev) => [...prev, newCell]);
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    setCells((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      {/* Jupyter Toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card/70 px-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-xs text-chart-2">
            <Sparkles size={14} /> PyPython 3.11 (Jupyter Kernel)
          </span>
          <span className="text-muted-foreground text-xs font-mono">nlp_notebook.ipynb</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addCell("code")}
            className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs text-foreground hover:bg-accent"
          >
            <Plus size={13} /> Code Cell
          </button>
          <button
            onClick={() => addCell("markdown")}
            className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs text-foreground hover:bg-accent"
          >
            <Plus size={13} /> Markdown
          </button>
          <button
            onClick={() => {
              const fullCode = cells
                .filter((c) => c.type === "code")
                .map((c) => c.content)
                .join("\n\n");
              onRunNotebook(fullCode);
            }}
            disabled={running}
            className="flex items-center gap-1.5 rounded bg-chart-2 px-3 py-1 text-xs font-semibold text-background hover:brightness-105 disabled:opacity-50"
          >
            {running ? <RotateCcw size={13} className="animate-spin" /> : <Play size={13} />}
            Run All Cells
          </button>
        </div>
      </div>

      {/* Notebook Scrollable Area */}
      <div className="labforge-scrollbar flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
        {cells.map((cell, idx) => (
          <div
            key={cell.id}
            className="group relative rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-primary/40 shadow-sm"
          >
            {/* Cell Controls */}
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground select-none">
              <span className="font-mono text-[11px] text-primary">
                {cell.type === "code"
                  ? `In [${cell.executionCount || "*"}]`
                  : "Markdown Cell"}
              </span>

              <button
                onClick={() => deleteCell(cell.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                title="Delete cell"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Cell Content Input */}
            {cell.type === "markdown" ? (
              <textarea
                value={cell.content}
                onChange={(e) => updateCellContent(cell.id, e.target.value)}
                rows={2}
                className="w-full resize-y bg-transparent text-sm leading-6 text-foreground font-sans outline-none"
              />
            ) : (
              <textarea
                value={cell.content}
                onChange={(e) => updateCellContent(cell.id, e.target.value)}
                rows={Math.max(3, cell.content.split("\n").length)}
                spellCheck={false}
                className="labforge-mono w-full resize-none bg-background/60 p-3 rounded border border-border text-xs leading-5 text-accent-foreground outline-none focus:border-chart-2"
              />
            )}

            {/* Cell Output */}
            {cell.type === "code" && cell.output && (
              <div className="mt-3 rounded border border-chart-2/30 bg-chart-2/5 p-3 text-xs">
                <div className="text-[10px] font-semibold text-chart-2 mb-1">Out [{cell.executionCount}]:</div>
                <pre className="labforge-mono text-foreground whitespace-pre-wrap">{cell.output}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
