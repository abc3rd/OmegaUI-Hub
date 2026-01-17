
import React, { useState, useEffect } from "react";
import { Query } from "@/entities/all";
import { Loader2, AlertCircle } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, Bar, 
  LineChart, Line, 
  AreaChart, Area,
  PieChart, Pie, Cell, 
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from "recharts";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
        <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {`${p.name}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardWidget({ widget, databaseId, filters, onAddFilter }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (widget.type !== "text" && widget.query_id) {
      loadData();
    }
  }, [widget.query_id, widget.type, widget.config, filters]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const query = await Query.get(widget.query_id);
      
      if (!query) {
        setError("Query not found");
        setLoading(false);
        return;
      }
      
      const xKey = widget.config?.x_column || "name";
      const yKey = widget.config?.y_column || "value";
      const zKey = widget.config?.z_column || "size";

      // Mock data execution - in production, you'd execute the actual query
      const rawMockData = [
        { name: "Jan", value: 4000, category: "A", size: 100 },
        { name: "Feb", value: 3000, category: "B", size: 120 },
        { name: "Mar", value: 2000, category: "A", size: 80 },
        { name: "Apr", value: 2780, category: "C", size: 150 },
        { name: "May", value: 1890, category: "B", size: 90 },
        { name: "Jun", value: 2390, category: "A", size: 110 },
      ];
      
      // Adapt mock data to use configured columns
      let mockData = rawMockData.map(item => ({
          [xKey]: item.name,
          [yKey]: item.value,
          [zKey]: item.size,
          ...item // keep original keys for other potential uses
      }));

      // Apply dashboard filters
      if (filters && filters.length > 0) {
        mockData = mockData.filter(row => {
          return filters.every(filter => {
            // Ensure both values are treated as strings for consistent comparison
            return String(row[filter.column]) === String(filter.value);
          });
        });
      }
      
      setData(mockData);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleChartClick = (payload) => {
    const { clickBehavior, x_column } = widget.config || {};
    if (!clickBehavior || !payload || !x_column) return;

    const value = payload[x_column];
    if (value === undefined) return;

    if (clickBehavior === 'filter') {
      if (typeof onAddFilter === 'function') {
        onAddFilter({ column: x_column, value });
      } else {
        console.warn("onAddFilter function not provided to DashboardWidget.");
      }
    } else if (clickBehavior === 'drilldown') {
      const dbId = databaseId;
      if (!dbId) {
        console.warn("Drill-down failed: databaseId is not available.");
        return;
      }
      const url = createPageUrl(`QueryEditor?db=${dbId}&filter_col=${x_column}&filter_val=${encodeURIComponent(value)}`);
      navigate(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  // Text widget
  if (widget.type === "text") {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{widget.text_content || "No content"}</ReactMarkdown>
      </div>
    );
  }

  // Metric widget
  if (widget.type === "metric") {
    const valueColumn = widget.config?.value_column || "value";
    const format = widget.config?.format || "number";
    const value = data?.[0]?.[valueColumn] || 0;
    
    let displayValue = value;
    if (format === "currency") displayValue = `$${value.toLocaleString()}`;
    else if (format === "percent") displayValue = `${value}%`;
    else displayValue = value.toLocaleString();

    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600 mb-2">{displayValue}</div>
          <div className="text-sm text-slate-500">{widget.title}</div>
        </div>
      </div>
    );
  }

  // Table widget
  if (widget.type === "table") {
    if (!data || data.length === 0) {
      return <div className="text-slate-500 text-center py-8 dark:text-slate-400">No data available</div>;
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold text-slate-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-slate-700">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Chart widgets
  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-center py-8 dark:text-slate-400">No data available</div>;
  }

  const xKey = widget.config?.x_column || Object.keys(data[0])[0];
  const yKey = widget.config?.y_column || Object.keys(data[0])[1];
  const zKey = widget.config?.z_column || null;
  const color = widget.config?.color || '#4f46e5';
  const showLegend = widget.config?.showLegend !== false;
  const showLabels = widget.config?.showLabels === true;

  // Bar Chart
  if (widget.type === "bar_chart") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} onClick={(e) => handleChartClick(e?.activePayload?.[0]?.payload)}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            {showLegend && <Legend />}
            <Bar dataKey={yKey} fill={color} label={showLabels ? { position: 'top' } : false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Line Chart
  if (widget.type === "line_chart") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} onClick={(e) => handleChartClick(e?.activePayload?.[0]?.payload)}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            {showLegend && <Legend />}
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} label={showLabels} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Area Chart
  if (widget.type === "area_chart") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} onClick={(e) => handleChartClick(e?.activePayload?.[0]?.payload)}>
            <defs>
              <linearGradient id={`color-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            {showLegend && <Legend />}
            <Area type="monotone" dataKey={yKey} stroke={color} fillOpacity={1} fill={`url(#color-${widget.id})`} label={showLabels} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pie Chart
  if (widget.type === "pie_chart") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={showLabels}
              onClick={(e) => handleChartClick(e?.payload?.payload)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Scatter Plot
  if (widget.type === "scatter_plot") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis type="number" dataKey={xKey} name={xKey} />
            <YAxis type="number" dataKey={yKey} name={yKey} />
            {zKey && <ZAxis type="number" dataKey={zKey} range={[10, 500]} name={zKey} />}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltip />} />
            {showLegend && <Legend />}
            <Scatter name={widget.title} data={data} fill={color} onClick={(e) => handleChartClick(e?.payload)} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <div className="text-slate-500 dark:text-slate-400">Unknown widget type</div>;
}
