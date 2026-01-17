
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Table as TableIcon, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import PaginationControls from "../shared/PaginationControls";

export default function QueryResults({ results, isRefreshing, autoRefreshEnabled }) {
  const { columns = [], rows = [], executionTime, rowCount, timestamp } = results || {};
  const [chartType, setChartType] = React.useState("bar");
  const [xKey, setXKey] = React.useState(columns[0] || "");
  const [yKey, setYKey] = React.useState(columns.find((c, idx) => idx > 0) || "");
  const [prevRowCount, setPrevRowCount] = React.useState(rowCount);
  const [rowCountChange, setRowCountChange] = React.useState(null);

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(50);

  const data = React.useMemo(() => {
    return rows.map((r, i) => {
      const obj = {};
      columns.forEach((c, idx) => {
        obj[c] = r[idx];
      });
      if (!xKey) obj.__index = i + 1;
      return obj;
    });
  }, [rows, columns, xKey]);

  // Paginated data for the table
  const paginatedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, pageIndex, pageSize]);

  const pageCount = Math.ceil(rows.length / pageSize);

  React.useEffect(() => {
    if (!xKey && columns.length > 0) setXKey(columns[0]);
    if (!yKey && columns.length > 1) setYKey(columns[1]);
    setPageIndex(0); // Reset to first page on new results
  }, [columns, xKey, yKey, rows]);

  // Track row count changes
  React.useEffect(() => {
    if (prevRowCount !== null && rowCount !== prevRowCount) {
      const change = rowCount - prevRowCount;
      setRowCountChange(change);
      setTimeout(() => setRowCountChange(null), 3000);
    }
    setPrevRowCount(rowCount);
  }, [rowCount, prevRowCount]);

  const downloadJSON = () => {
    const out = rows.map(r => {
      const o = {};
      columns.forEach((c, idx) => o[c] = r[idx]);
      return o;
    });
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const header = columns.join(",");
    const body = rows.map(r => r.map(cell => {
      const v = cell == null ? "" : String(cell);
      if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
      return v;
    }).join(",")).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
        <CardHeader className="pb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Results
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
            {typeof rowCount === "number" && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {rowCount} rows • {executionTime}ms
                </Badge>
                <AnimatePresence>
                  {rowCountChange !== null && rowCountChange !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className={rowCountChange > 0 ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300"}
                      >
                        <TrendingUp className={`w-3 h-3 mr-1 ${rowCountChange < 0 ? 'rotate-180' : ''}`} />
                        {rowCountChange > 0 ? '+' : ''}{rowCountChange}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
                {autoRefreshEnabled && timestamp && (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs dark:bg-slate-800 dark:text-slate-300">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(timestamp)}
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV} size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" onClick={downloadJSON} size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" /> JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={timestamp}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="overflow-auto border rounded-lg dark:border-slate-700 max-h-[50vh]"
            >
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-800/80">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRows.map((row, i) => (
                    <motion.tr
                      key={`${i}-${timestamp}`}
                      initial={{ backgroundColor: isRefreshing ? "rgba(59, 130, 246, 0.1)" : "transparent" }}
                      animate={{ backgroundColor: "transparent" }}
                      transition={{ duration: 0.5 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      {row.map((cell, idx) => (
                        <td key={idx} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                          {typeof cell === "object" ? JSON.stringify(cell) : String(cell ?? "")}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={columns.length || 1}>
                        No results.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>

          {columns.length >= 2 && (
            <div className="space-y-3 pt-6">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Visualization</span>
                  {autoRefreshEnabled && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs dark:bg-green-900/50 dark:text-green-300">
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="Chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={xKey || ""} onValueChange={setXKey}>
                    <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="X axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={yKey || ""} onValueChange={setYKey}>
                    <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="Y axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <motion.div
                key={`chart-${timestamp}`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey={xKey || "__index"} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={yKey} fill="#4f46e5" />
                    </BarChart>
                  ) : (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey={xKey || "__index"} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey={yKey} stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}
        </CardContent>
        {rows.length > 0 && (
          <PaginationControls
            itemCount={rows.length}
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
    </motion.div>
  );
}
