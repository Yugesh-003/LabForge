import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface FileConfirmModalProps {
  open: boolean;
  fileName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const FileConfirmModal: React.FC<FileConfirmModalProps> = ({
  open,
  fileName,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold">Delete File Confirmation</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Are you sure you want to permanently delete <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{fileName}</code>?
            This operation cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="gap-1.5"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
