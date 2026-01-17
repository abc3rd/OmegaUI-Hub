import React, { useState } from "react";
import { DataRecord } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function RecordForm({ open, onOpenChange, table, record, onSaved }) {
  const [values, setValues] = useState(record?.data || {});

  const setField = (field, value) => setValues((v) => ({ ...v, [field]: value }));

  const save = async () => {
    if (record) {
      const updated = await DataRecord.update(record.id, { data: values });
      onSaved?.(updated);
    } else {
      const created = await DataRecord.create({ table_id: table.id, data: values });
      onSaved?.(created);
    }
    onOpenChange(false);
  };

  const renderInput = (col) => {
    const v = values[col.name] ?? "";
    switch (col.type) {
      case "number":
        return <Input type="number" value={v} onChange={(e) => setField(col.name, Number(e.target.value))} />;
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Switch checked={!!v} onCheckedChange={(val) => setField(col.name, val)} />
            <span className="text-sm text-slate-600">{v ? "True" : "False"}</span>
          </div>
        );
      case "date":
        return <Input type="date" value={v} onChange={(e) => setField(col.name, e.target.value)} />;
      case "text":
        return <Textarea value={v} onChange={(e) => setField(col.name, e.target.value)} />;
      case "json":
        return <Textarea value={typeof v === "string" ? v : JSON.stringify(v || {})} onChange={(e) => setField(col.name, e.target.value)} />;
      default:
        return <Input value={v} onChange={(e) => setField(col.name, e.target.value)} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Record" : "Add Record"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {table.columns?.map((col) => (
            <div key={col.name} className="grid gap-1.5">
              <Label>{col.name}{col.required ? " *" : ""}</Label>
              {renderInput(col)}
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="bg-green-600 hover:bg-green-700">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}