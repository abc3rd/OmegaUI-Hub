import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export default function ConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  confirmText,
  requireTyping = false,
  warnings = [],
  isDeleting = false
}) {
  const [confirmValue, setConfirmValue] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (requireTyping && confirmValue !== confirmText) return;
    
    setProcessing(true);
    try {
      await onConfirm();
      setConfirmValue("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error during confirmation:", error);
    }
    setProcessing(false);
  };

  const canConfirm = requireTyping ? confirmValue === confirmText : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>{title || "Confirm Deletion"}</DialogTitle>
              <DialogDescription className="mt-1">
                {description || "This action cannot be undone."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {itemName && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">{itemType || "Item"} to delete:</div>
              <div className="font-semibold text-slate-900">{itemName}</div>
            </div>
          )}

          {warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Warning:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {requireTyping && confirmText && (
            <div className="space-y-2">
              <Label>
                Type <span className="font-mono font-bold text-red-600">{confirmText}</span> to confirm
              </Label>
              <Input
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={confirmText}
                className="font-mono"
                autoComplete="off"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setConfirmValue("");
              onOpenChange(false);
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isDeleting ? "Deleting..." : "Processing..."}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Delete" : "Confirm"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}