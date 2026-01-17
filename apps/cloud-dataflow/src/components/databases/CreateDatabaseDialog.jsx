import React, { useState, useEffect } from "react";
import DatabaseConnectionDialog from "./DatabaseConnectionDialog";

export default function CreateDatabaseDialog({ open, onOpenChange, onCreated }) {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConnectionDialog(true);
      onOpenChange(false); // Close the simple dialog
    }
  }, [open, onOpenChange]);

  return (
    <DatabaseConnectionDialog
      open={showConnectionDialog}
      onOpenChange={setShowConnectionDialog}
      onSaved={onCreated}
    />
  );
}