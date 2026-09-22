import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useEditorSettings, EditorSettings } from "@/hooks/useEditorSettings";
import { getSystemReadinessServerFn } from "@/api/functions/execution";
import { SystemReadinessReport } from "@/api/services/systemChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Sun,
  Moon,
  Type,
  Layout,
  Terminal,
  Database,
  Code2,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface SystemSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: (settings: EditorSettings) => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  open,
  onOpenChange,
  onSettingsChange,
}) => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useEditorSettings();
  const [report, setReport] = useState<SystemReadinessReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSystemReadinessServerFn()
        .then((res) => setReport(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleUpdate = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    updateSetting(key, value);
    if (onSettingsChange) {
      onSettingsChange({ ...settings, [key]: value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-card-foreground shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold">LabForge System Settings</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Manage editor preferences, workspace layouts, theme appearance, and live system capabilities.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full mt-2">
          <TabsList className="grid grid-cols-4 bg-muted p-1">
            <TabsTrigger value="appearance" className="gap-1.5 text-xs">
              <Sun className="h-3.5 w-3.5" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-1.5 text-xs">
              <Type className="h-3.5 w-3.5" /> Editor
            </TabsTrigger>
            <TabsTrigger value="workspace" className="gap-1.5 text-xs">
              <Layout className="h-3.5 w-3.5" /> Workspace
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-1.5 text-xs">
              <Info className="h-3.5 w-3.5" /> System Status
            </TabsTrigger>
          </TabsList>

          {/* 1. Appearance Section */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Theme Mode</span>
                <span className="text-xs text-muted-foreground capitalize">{theme} Theme</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-3 p-3 rounded-md border text-left transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10 font-bold"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  <div className="p-2 rounded bg-amber-500/20 text-amber-500">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm">Light Mode</div>
                    <div className="text-[11px] text-muted-foreground">Academic Light Blue</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-3 p-3 rounded-md border text-left transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 font-bold"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  <div className="p-2 rounded bg-indigo-500/20 text-indigo-400">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm">Dark Mode</div>
                    <div className="text-[11px] text-muted-foreground">Deep Navy Dark</div>
                  </div>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* 2. Editor Preferences Section */}
          <TabsContent value="editor" className="space-y-4 pt-4">
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4">
              {/* Font Size */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Editor Font Size</div>
                  <div className="text-xs text-muted-foreground">Control editor text size in pixels</div>
                </div>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleUpdate("fontSize", Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-card px-3 text-xs outline-none focus:border-primary font-mono"
                >
                  <option value={12}>12 px (Small)</option>
                  <option value={14}>14 px (Default)</option>
                  <option value={16}>16 px (Medium)</option>
                  <option value={18}>18 px (Large)</option>
                </select>
              </div>

              <div className="h-px bg-border" />

              {/* Tab Size */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Tab Size (Indentation)</div>
                  <div className="text-xs text-muted-foreground">Spaces per indentation level</div>
                </div>
                <select
                  value={settings.tabSize}
                  onChange={(e) => handleUpdate("tabSize", Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-card px-3 text-xs outline-none focus:border-primary font-mono"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              <div className="h-px bg-border" />

              {/* Word Wrap */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Word Wrap</div>
                  <div className="text-xs text-muted-foreground">Wrap long lines automatically in editor</div>
                </div>
                <Switch
                  checked={settings.wordWrap === "on"}
                  onCheckedChange={(checked) => handleUpdate("wordWrap", checked ? "on" : "off")}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Autosave Preference */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Autosave Preference</div>
                  <div className="text-xs text-muted-foreground">Automatically save solution buffers</div>
                </div>
                <select
                  value={settings.autosave}
                  onChange={(e) => handleUpdate("autosave", e.target.value as any)}
                  className="h-9 rounded-md border border-input bg-card px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="off">Off (Manual Save)</option>
                  <option value="afterDelay">After Delay (1s)</option>
                  <option value="onFocusChange">On Window Focus Change</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* 3. Workspace Layout Section */}
          <TabsContent value="workspace" className="space-y-4 pt-4">
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4">
              {/* Terminal Visibility */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">Bottom Terminal Panel</div>
                    <div className="text-xs text-muted-foreground">Show execution output and test results at bottom</div>
                  </div>
                </div>
                <Switch
                  checked={settings.terminalVisible}
                  onCheckedChange={(checked) => handleUpdate("terminalVisible", checked)}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Panel Layout */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Workspace Layout Mode</div>
                  <div className="text-xs text-muted-foreground">Position exercise navigation and problem specifications</div>
                </div>
                <select
                  value={settings.panelLayout}
                  onChange={(e) => handleUpdate("panelLayout", e.target.value as any)}
                  className="h-9 rounded-md border border-input bg-card px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="default">Default (Left Sidebar, Center Editor)</option>
                  <option value="expanded-editor">Expanded Editor (Focused)</option>
                  <option value="sidebar-right">Right Sidebar Layout</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* 4. System Status Section */}
          <TabsContent value="system" className="space-y-3 pt-4">
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Capability</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Database Connection (MongoDB)</span>
                </span>
                {report?.mongodb.status === "healthy" ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    Connected ({report.mongodb.latencyMs}ms)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    Disconnected
                  </Badge>
                )}
              </div>

              {/* Python Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-500" />
                  <span>Python 3.x Environment</span>
                </span>
                {report?.python.available ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    Available ({report.python.version?.split(" ")[1] || "Python 3"})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    Not Found
                  </Badge>
                )}
              </div>

              {/* Jupyter Kernel Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-500" />
                  <span>Jupyter NLP Kernel</span>
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  Ready (Multi-cell Engine)
                </Badge>
              </div>

              {/* C++ Compiler Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-500" />
                  <span>C++ Compiler (`g++` / `clang++`)</span>
                </span>
                {report?.cpp.available ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    Detected ({report.cpp.name})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    Not in PATH
                  </Badge>
                )}
              </div>

              <div className="h-px bg-border my-2" />

              {/* App Version */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Application Version</span>
                <span className="font-mono font-semibold text-foreground">v1.2.0 (Offline Studio)</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-end gap-2 pt-2">
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Close Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
