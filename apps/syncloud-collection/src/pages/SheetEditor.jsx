import React, { useState, useEffect } from 'react';
import { Spreadsheet } from '@/entities/Spreadsheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sheet, Plus, Save, Trash2, Download, List, Columns, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SheetEditor() {
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpreadsheets();
  }, []);

  const loadSpreadsheets = async () => {
    setLoading(true);
    try {
      const sheets = await Spreadsheet.list('-updated_date');
      setSpreadsheets(sheets);
    } catch (error) {
      toast.error('Failed to load spreadsheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSheet = (sheet) => {
    setActiveSheet(sheet);
    setTitle(sheet.title);
    setColumns(sheet.columns || []);
    setRows(sheet.rows || []);
  };

  const handleNewSheet = () => {
    setActiveSheet(null);
    setTitle('Untitled Spreadsheet');
    setColumns([{ id: 'col1', name: 'Column A' }]);
    setRows([{ id: 'row1' }]);
  };

  const handleSaveSheet = async () => {
    if (!title.trim()) {
      toast.error('Spreadsheet title is required.');
      return;
    }
    const data = { title, columns, rows };
    try {
      if (activeSheet) {
        await Spreadsheet.update(activeSheet.id, data);
        toast.success('Spreadsheet updated!');
      } else {
        const newSheet = await Spreadsheet.create(data);
        setActiveSheet(newSheet);
        toast.success('Spreadsheet saved!');
      }
      loadSpreadsheets();
    } catch (error) {
      toast.error('Failed to save spreadsheet.');
    }
  };

  const handleDeleteSheet = async (sheetId) => {
    try {
      await Spreadsheet.delete(sheetId);
      toast.success('Spreadsheet deleted.');
      if (activeSheet?.id === sheetId) {
        handleNewSheet();
      }
      loadSpreadsheets();
    } catch (error) {
      toast.error('Failed to delete spreadsheet.');
    }
  };

  const addColumn = () => {
    const newColId = `col${columns.length + 1}`;
    setColumns([...columns, { id: newColId, name: `Column ${String.fromCharCode(65 + columns.length)}` }]);
  };
  
  const addRow = () => {
    setRows([...rows, { id: `row${rows.length + 1}` }]);
  };
  
  const handleCellChange = (rowIndex, colId, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colId]: value };
    setRows(newRows);
  };
  
  const handleColumnNameChange = (colIndex, name) => {
    const newCols = [...columns];
    newCols[colIndex].name = name;
    setColumns(newCols);
  };

  const downloadCSV = () => {
    const headers = columns.map(c => c.name).join(',');
    const csvRows = rows.map(row => {
      return columns.map(col => {
        const val = row[col.id] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csvContent = `${headers}\n${csvRows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-r bg-card flex flex-col">
        <CardHeader><CardTitle className="flex items-center gap-2"><List /> My Spreadsheets</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Button onClick={handleNewSheet} className="w-full mb-4"><Plus className="w-4 h-4 mr-2" /> New Sheet</Button>
          {spreadsheets.map(sheet => (
            <div key={sheet.id} onClick={() => handleSelectSheet(sheet)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${activeSheet?.id === sheet.id ? 'bg-primary/20' : 'hover:bg-accent'}`}>
              <span className="truncate flex-1">{sheet.title}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteSheet(sheet.id) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Sheet className="w-6 h-6 text-primary" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spreadsheet Title" className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0" />
          <Button onClick={addRow} variant="outline"><PlusCircle className="w-4 h-4 mr-2" /> Add Row</Button>
          <Button onClick={addColumn} variant="outline"><Columns className="w-4 h-4 mr-2" /> Add Column</Button>
          <Button onClick={handleSaveSheet}><Save className="w-4 h-4 mr-2" /> Save</Button>
          <Button variant="outline" onClick={downloadCSV}><Download className="w-4 h-4 mr-2" /> Download CSV</Button>
        </div>
        <div className="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, colIndex) => (
                  <TableHead key={col.id}>
                    <Input value={col.name} onChange={(e) => handleColumnNameChange(colIndex, e.target.value)} className="border-0 bg-transparent p-0" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={row.id}>
                  {columns.map(col => (
                    <TableCell key={col.id}>
                      <Input value={row[col.id] || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="border-0 bg-transparent p-0" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}