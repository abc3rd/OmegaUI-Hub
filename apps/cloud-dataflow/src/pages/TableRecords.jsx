
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table as TableEntity, DataRecord, ActivityLog } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowLeft, Table as TableIcon } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import RecordForm from "@/components/records/RecordForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PaginationControls from "@/components/shared/PaginationControls"; // New import

export default function TableRecordsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get("table");
  const [table, setTable] = useState(null);
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [role, setRole] = useState("viewer");
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);

  const load = useCallback(async () => {
    if (!tableId) return;
    const ts = await TableEntity.list();
    const t = ts.find(x => x.id === tableId);
    setTable(t || null);
    const recs = await DataRecord.filter({ table_id: tableId }, "-updated_date"); // Removed limit: 200
    setRecords(recs);
    setPageIndex(0); // Reset page on load
  }, [tableId]);

  useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
    load(); // Call load here after role is potentially set
  }, [load]); // Depend on load to re-run when tableId changes

  const handleDelete = async () => {
    if (!deletingRecord) return;
    
    await DataRecord.delete(deletingRecord.id);
    await ActivityLog.create({
      database_id: table?.database_id,
      table_id: table?.id,
      action: "DELETE",
      entity_type: "record",
      entity_id: deletingRecord.id,
      details: `Deleted record from ${table?.name}`
    });
    load();
    setDeletingRecord(null);
  };

  const getRecordPreview = (record) => {
    if (!table?.columns || !record?.data) return "Record";
    const previewColumns = table.columns.slice(0, 3);
    return previewColumns
      .map(col => `${col.name}: ${record.data?.[col.name] || 'N/A'}`)
      .join(', ');
  };

  const paginatedRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, pageIndex, pageSize]);

  const pageCount = Math.ceil(records.length / pageSize);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl(`DatabaseDetail?id=${table?.database_id || ""}`)}>
          <Button variant="outline" className="dark:border-slate-600 dark:hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Table Records</h1>
      </div>

      {table ? (
        <Card className="border-slate-200 dark:border-slate-700 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <TableIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {table.name}
              <Badge variant="secondary" className="ml-2 dark:bg-slate-800 dark:text-slate-300">{table.record_count || 0} records</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <div className="text-slate-600 dark:text-slate-400">{table.description || "No description"}</div>
              {(role === "admin" || role === "editor") && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditRecord(null); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Record
                </Button>
              )}
            </div>

            <div className="overflow-auto border rounded-lg dark:border-slate-700 max-h-[60vh]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                  <tr>
                    {table.columns?.map((c) => (
                      <th key={c.name} className="px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-800/80">{c.name}</th>
                    ))}
                    <th className="px-3 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-800/80">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      {table.columns?.map((c) => (
                        <td key={c.name} className="px-3 py-2 text-sm font-mono text-slate-700 dark:text-slate-300">
                          {typeof r.data?.[c.name] === "object"
                            ? JSON.stringify(r.data?.[c.name])
                            : String(r.data?.[c.name] ?? "")}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        {(role === "admin" || role === "editor") ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditRecord(r); setShowForm(true); }} className="dark:border-slate-600 dark:hover:bg-slate-800">
                              Edit
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingRecord(r)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={(table.columns?.length || 0) + 1}>
                        No records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {records.length > 0 && (
            <PaginationControls
              itemCount={records.length}
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setPageSize={setPageSize}
              gotoPage={setPageIndex}
              nextPage={() => setPageIndex(p => p + 1)}
              previousPage={() => setPageIndex(p => p - 1)}
              canPreviousPage={pageIndex > 0}
              canNextPage={pageIndex < pageCount - 1}
            />
          )}
        </Card>
      ) : (
        <div className="text-slate-500 dark:text-slate-400">Table not found.</div>
      )}

      {table && (
        <RecordForm
          open={showForm}
          onOpenChange={setShowForm}
          table={table}
          record={editRecord}
          onSaved={() => load()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        description="This will permanently delete this record from the table."
        itemName={deletingRecord ? getRecordPreview(deletingRecord) : ""}
        itemType="Record"
        requireTyping={false}
        warnings={[
          "This record will be permanently deleted",
          "This action cannot be undone"
        ]}
        isDeleting={true}
      />
    </div>
  );
}
