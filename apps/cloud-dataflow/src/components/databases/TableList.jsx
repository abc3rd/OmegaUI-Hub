import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table as TableEntity, ActivityLog } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Table2, Trash2, List } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function TableList({ tables, canEdit, onDeleted }) {
  const [deletingTable, setDeletingTable] = useState(null);

  const handleDelete = async () => {
    if (!deletingTable) return;
    
    await TableEntity.delete(deletingTable.id);
    await ActivityLog.create({
      database_id: deletingTable.database_id,
      table_id: deletingTable.id,
      action: "DELETE",
      entity_type: "table",
      entity_id: deletingTable.id,
      details: `Deleted table ${deletingTable.name}`
    });
    onDeleted?.(deletingTable);
    setDeletingTable(null);
  };

  return (
    <>
      <div className="grid gap-4">
        {tables.map((t) => (
          <Card key={t.id} className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Table2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.description || "No description"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {t.record_count || 0} records
                </Badge>
                <Link to={createPageUrl(`TableRecords?table=${t.id}`)}>
                  <Button variant="outline" size="sm" className="border-slate-300">
                    <List className="w-4 h-4 mr-1" /> Records
                  </Button>
                </Link>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => setDeletingTable(t)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {tables.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            No tables yet. Create your first table to start adding data.
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingTable}
        onOpenChange={(open) => !open && setDeletingTable(null)}
        onConfirm={handleDelete}
        title="Delete Table"
        description="This will permanently delete the table and all its data."
        itemName={deletingTable?.name}
        itemType="Table"
        confirmText={deletingTable?.name}
        requireTyping={true}
        warnings={[
          `All ${deletingTable?.record_count || 0} records in this table will be permanently deleted`,
          "Any queries referencing this table may break",
          "Dashboard widgets using this table will no longer work",
          "This action cannot be undone"
        ]}
        isDeleting={true}
      />
    </>
  );
}