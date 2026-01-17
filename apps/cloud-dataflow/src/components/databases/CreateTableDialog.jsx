import React, { useState } from "react";
import { Table as TableEntity, ActivityLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function CreateTableDialog({ open, onOpenChange, databaseId, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState([
    { name: "id", type: "number", required: true }
  ]);

  const addColumn = () => setColumns([...columns, { name: "", type: "string", required: false }]);
  const removeColumn = (idx) => setColumns(columns.filter((_, i) => i !== idx));
  const updateColumn = (idx, field, value) => {
    const next = [...columns];
    next[idx][field] = value;
    setColumns(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const table = await TableEntity.create({
      database_id: databaseId,
      name: name.trim(),
      description,
      columns,
      record_count: 0,
      last_modified: new Date().toISOString()
    });
    await ActivityLog.create({
      database_id: databaseId,
      table_id: table.id,
      action: "CREATE",
      entity_type: "table",
      entity_id: table.id,
      details: `Created table ${table.name} (${columns.length} columns)`
    });
    onCreated?.(table);
    onOpenChange(false);
    setName("");
    setDescription("");
    setColumns([{ name: "id", type: "number", required: true }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Table Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Columns</Label>
              <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                <Plus className="w-4 h-4 mr-1" /> Add column
              </Button>
            </div>
            <div className="space-y-2">
              {columns.map((col, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <Input
                    placeholder="name"
                    value={col.name}
                    onChange={(e) => updateColumn(idx, "name", e.target.value)}
                  />
                  <Select
                    value={col.type}
                    onValueChange={(v) => updateColumn(idx, "type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">string</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="boolean">boolean</SelectItem>
                      <SelectItem value="date">date</SelectItem>
                      <SelectItem value="json">json</SelectItem>
                      <SelectItem value="text">text</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={col.required ? "yes" : "no"}
                    onValueChange={(v) => updateColumn(idx, "required", v === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Required" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Required</SelectItem>
                      <SelectItem value="no">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColumn(idx)}
                    className="justify-self-start md:justify-self-end"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}