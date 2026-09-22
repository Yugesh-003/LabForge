import { useState } from "react";
import { Lab, Exercise } from "@/types/labforge";
import {
  Braces,
  ChevronRight,
  FileCode,
  Play,
  RotateCcw,
  Menu,
  Bot,
  LogOut,
  FileText,
  Cpu,
  Sun,
  Moon,
  FolderOpen,
  Save,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/hooks/useTheme";
import { SystemReadinessModal } from "./SystemReadinessModal";
import { SystemSettingsModal } from "./SystemSettingsModal";
import { FileConfirmModal } from "./FileConfirmModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VSCodeHeaderProps {
  lab: Lab;
  exercise?: Exercise;
  running: boolean;
  onRun: () => void;
  showSidebar: boolean;
  setShowSidebar: (val: boolean | ((prev: boolean) => boolean)) => void;
  showDetails: boolean;
  setShowDetails: (val: boolean | ((prev: boolean) => boolean)) => void;
  showAi: boolean;
  setShowAi: (val: boolean | ((prev: boolean) => boolean)) => void;
  onFileAction?: (action: "new" | "open" | "save" | "saveAs" | "rename" | "delete") => void;
}

export function VSCodeHeader({
  lab,
  exercise,
  running,
  onRun,
  showSidebar,
  setShowSidebar,
  showDetails,
  setShowDetails,
  showAi,
  setShowAi,
  onFileAction,
}: VSCodeHeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const getFileName = () => {
    if (lab.technology === "MongoDB") return "solution.mongodb";
    if (lab.technology === "Python + Jupyter") return "nlp_notebook.ipynb";
    return "solution.cpp";
  };

  const handleAction = (action: "new" | "open" | "save" | "saveAs" | "rename" | "delete") => {
    if (action === "delete") {
      setConfirmDeleteOpen(true);
    } else {
      if (onFileAction) onFileAction(action);
    }
  };

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-sidebar px-3 select-none">
        {/* Left: Brand, Breadcrumbs, File Dropdown, Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/student/labs" })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
              <Braces size={16} strokeWidth={2.5} />
            </div>
            <span className="labforge-display text-sm font-bold tracking-wide text-foreground">
              LABFORGE
            </span>
          </button>

          <div className="hidden h-4 w-px bg-border sm:block" />

          {/* File Management Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground outline-none border border-border">
              <span>File</span>
              <ChevronDown size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 bg-popover border-border">
              <DropdownMenuItem onClick={() => handleAction("new")} className="gap-2 text-xs">
                <Plus size={14} /> New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("open")} className="gap-2 text-xs">
                <FolderOpen size={14} /> Open File...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("save")} className="gap-2 text-xs">
                <Save size={14} /> Save Solution
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("saveAs")} className="gap-2 text-xs">
                <Save size={14} /> Save As...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("rename")} className="gap-2 text-xs">
                <Edit2 size={14} /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("delete")}
                className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 size={14} /> Delete File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center gap-2 text-xs md:flex">
            <span className="text-muted-foreground">{lab.name}</span>
            <ChevronRight size={13} className="text-muted-foreground/50" />
            <span className="font-medium text-foreground">
              {exercise ? exercise.title : "Workspace"}
            </span>
            {exercise?.isAiGenerated && (
              <span className="ml-1 rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-semibold text-chart-4">
                AI Extra
              </span>
            )}
          </div>

          {/* Active File Tab */}
          <div className="hidden items-center gap-2 border-b-2 border-primary bg-card/60 px-3 py-1 text-xs text-foreground lg:flex">
            <FileCode size={13} className="text-primary" />
            <span>{getFileName()}</span>
            <span className="size-1.5 rounded-full bg-chart-3" />
          </div>
        </div>

        {/* Right Controls: Settings, Diagnostics, Theme, Run Code, Pane toggles */}
        <div className="flex items-center gap-2">
          {/* System Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            title="System Settings"
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Settings size={15} />
          </button>

          {/* System Readiness Diagnostic Button */}
          <button
            onClick={() => setReadinessOpen(true)}
            title="Check System Diagnostics & Tools"
            className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Cpu size={14} className="text-primary" />
            <span className="hidden sm:inline">System Diagnostics</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-105 disabled:opacity-50 transition-all"
          >
            {running ? (
              <>
                <RotateCcw size={13} className="animate-spin" /> Executing...
              </>
            ) : (
              <>
                <Play size={13} /> Run Code
              </>
            )}
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            title="Toggle exercises list"
            className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
              showSidebar ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Menu size={15} />
          </button>

          <button
            onClick={() => setShowDetails((prev) => !prev)}
            title="Toggle problem details"
            className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
              showDetails ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <FileText size={15} />
          </button>

          <button
            onClick={() => setShowAi((prev) => !prev)}
            title="Toggle AI chatbot"
            className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
              showAi ? "border-chart-4/50 bg-chart-4/10 text-chart-4" : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Bot size={15} />
          </button>

          <button
            onClick={() => navigate({ to: "/" })}
            title="Sign out"
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors ml-1"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <SystemSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Diagnostics Modal */}
      <SystemReadinessModal open={readinessOpen} onOpenChange={setReadinessOpen} />

      {/* File Delete Confirmation Modal */}
      <FileConfirmModal
        open={confirmDeleteOpen}
        fileName={getFileName()}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={() => {
          if (onFileAction) onFileAction("delete");
        }}
      />
    </>
  );
}
