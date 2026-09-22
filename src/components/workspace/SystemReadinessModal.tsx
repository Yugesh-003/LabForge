import React, { useEffect, useState } from "react";
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
import { RefreshCw, Database, Code, Cpu, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface SystemReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemReadinessModal: React.FC<SystemReadinessModalProps> = ({ open, onOpenChange }) => {
  const [report, setReport] = useState<SystemReadinessReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getSystemReadinessServerFn();
      setReport(res);
    } catch (err) {
      console.error("Failed to check system readiness:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-card-foreground shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl font-bold">System Readiness Diagnostic</DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              className="gap-2 border-border hover:bg-muted"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Re-check
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Verification status for local database services, compiler tools, Python 3.x, and NLP lab packages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* MongoDB Card */}
          <div className="p-4 rounded-lg border border-border bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Database className="h-5 w-5 text-blue-500" />
                <span>MongoDB Service</span>
              </div>
              {report?.mongodb.status === "healthy" ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Healthy ({report.mongodb.latencyMs}ms)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Disconnected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Database: <code className="bg-muted px-1.5 py-0.5 rounded">{report?.mongodb.databaseName || "labforge"}</code>
            </p>
          </div>

          {/* C++ Compiler Card */}
          <div className="p-4 rounded-lg border border-border bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Code className="h-5 w-5 text-cyan-500" />
                <span>C++ Compiler Engine (GCC / Clang)</span>
              </div>
              {report?.cpp.available ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Detected ({report.cpp.name})
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Not Found in PATH
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {report?.cpp.version || "g++ executable not detected. C++ labs require MinGW-w64 or GCC in PATH."}
            </p>
          </div>

          {/* Python & NLP Packages Card */}
          <div className="p-4 rounded-lg border border-border bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Cpu className="h-5 w-5 text-amber-500" />
                <span>Python 3 & NLP Jupyter Environment</span>
              </div>
              {report?.python.available ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Available ({report.python.version?.split(" ")[1]})
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Python Not Found
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 pt-1">
              <span>Required Packages:</span>
              {Object.entries(report?.python.packages || {}).map(([pkg, installed]) => (
                <Badge
                  key={pkg}
                  variant="secondary"
                  className={installed ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground opacity-60"}
                >
                  {pkg} {installed ? "✓" : "✗"}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {report?.timestamp ? `Last verified: ${new Date(report.timestamp).toLocaleTimeString()}` : "Checking capabilities..."}
          </p>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Close Diagnostic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
