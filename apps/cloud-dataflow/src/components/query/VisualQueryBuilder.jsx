
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  X,
  Link2,
  AlertCircle
} from "lucide-react";
import { Table as TableEntity } from "@/entities/all";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QueryPlanVisualizer from "./QueryPlanVisualizer";

const AGGREGATION_FUNCTIONS = [
  { value: "COUNT", label: "COUNT - Count rows" },
  { value: "SUM", label: "SUM - Sum values" },
  { value: "AVG", label: "AVG - Average" },
  { value: "MIN", label: "MIN - Minimum" },
  { value: "MAX", label: "MAX - Maximum" },
  { value: "GROUP_CONCAT", label: "GROUP_CONCAT - Concatenate" }
];

const OPERATORS = [
  { value: "=", label: "equals (=)" },
  { value: "!=", label: "not equals (!=)" },
  { value: ">", label: "greater than (>)" },
  { value: "<", label: "less than (<)" },
  { value: ">=", label: "greater or equal (>=)" },
  { value: "<=", label: "less or equal (<=)" },
  { value: "LIKE", label: "contains (LIKE)" },
  { value: "NOT LIKE", label: "not contains (NOT LIKE)" },
  { value: "IN", label: "in list (IN)" },
  { value: "NOT IN", label: "not in list (NOT IN)" },
  { value: "IS NULL", label: "is null" },
  { value: "IS NOT NULL", label: "is not null" }
];

const JOIN_OPERATORS = [
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
];

const JOIN_TYPES = [
  { value: "INNER JOIN", label: "INNER JOIN - Match both sides" },
  { value: "LEFT JOIN", label: "LEFT JOIN - All from left + matches" },
  { value: "RIGHT JOIN", label: "RIGHT JOIN - All from right + matches" },
  { value: "FULL OUTER JOIN", label: "FULL OUTER JOIN - All from both" }
];

export default function VisualQueryBuilder({ onQueryChange }) {
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([{ id: "", name: "", alias: "" }]);
  const [joins, setJoins] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [conditions, setConditions] = useState([{
    column: "",
    operator: "=",
    value: "",
    logic: "AND"
  }]);
  const [groupBy, setGroupBy] = useState([]);
  const [havingConditions, setHavingConditions] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [limit, setLimit] = useState("");
  const [offset, setOffset] = useState("");
  const [distinct, setDistinct] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    (async () => {
      const ts = await TableEntity.list("-updated_date", 300);
      setTables(ts);
    })();
  }, []);

  // Get all columns from all selected tables
  const getAllColumns = useCallback(() => {
    const cols = [];
    selectedTables.forEach((st, idx) => {
      const table = tables.find(t => t.id === st.id);
      if (table && table.columns) {
        table.columns.forEach(col => {
          cols.push({
            tableName: table.name,
            tableAlias: st.alias || table.name,
            tableIndex: idx,
            columnName: col.name,
            columnType: col.type,
            fullName: st.alias
              ? `${st.alias}.${col.name}`
              : `${table.name}.${col.name}`
          });
        });
      }
    });
    return cols;
  }, [selectedTables, tables]);

  const addTable = () => {
    setSelectedTables([...selectedTables, { id: "", name: "", alias: "" }]);
  };

  const removeTable = (idx) => {
    setSelectedTables(selectedTables.filter((_, i) => i !== idx));
    if (idx > 0) {
      setJoins(joins.filter((_, i) => i !== idx - 1));
    }
  };

  const updateTable = (idx, field, value) => {
    const updated = [...selectedTables];
    if (field === "id") {
      const selectedTable = tables.find(t => t.id === value);
      updated[idx] = { ...updated[idx], id: value, name: selectedTable?.name || "" };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setSelectedTables(updated);
  };

  const addJoin = () => {
    setJoins([...joins, {
      type: "INNER JOIN",
      leftColumn: "",
      operator: "=",
      rightColumn: ""
    }]);
  };

  const updateJoin = (idx, field, value) => {
    const updated = [...joins];
    updated[idx] = { ...updated[idx], [field]: value };
    setJoins(updated);
  };

  const toggleColumn = (columnInfo) => {
    const exists = selectedColumns.find(c => c.fullName === columnInfo.fullName);
    if (exists) {
      setSelectedColumns(selectedColumns.filter(c => c.fullName !== columnInfo.fullName));
    } else {
      setSelectedColumns([...selectedColumns, {
        ...columnInfo,
        aggregation: null,
        alias: ""
      }]);
    }
  };

  const updateColumnAggregation = (fullName, aggregation) => {
    setSelectedColumns(selectedColumns.map(c =>
      c.fullName === fullName ? { ...c, aggregation } : c
    ));
  };

  const updateColumnAlias = (fullName, alias) => {
    setSelectedColumns(selectedColumns.map(c =>
      c.fullName === fullName ? { ...c, alias } : c
    ));
  };

  const addCustomColumn = () => {
    setCustomColumns([...customColumns, { expression: "", alias: "" }]);
  };

  const removeCustomColumn = (idx) => {
    setCustomColumns(customColumns.filter((_, i) => i !== idx));
  };

  const updateCustomColumn = (idx, field, value) => {
    const updated = [...customColumns];
    updated[idx] = { ...updated[idx], [field]: value };
    setCustomColumns(updated);
  };

  const addCondition = () => {
    setConditions([...conditions, {
      column: "",
      operator: "=",
      value: "",
      logic: "AND"
    }]);
  };

  const removeCondition = (idx) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const updateCondition = (idx, field, value) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], [field]: value };
    setConditions(updated);
  };

  const addGroupBy = (column) => {
    if (!groupBy.includes(column)) {
      setGroupBy([...groupBy, column]);
    }
  };

  const removeGroupBy = (column) => {
    setGroupBy(groupBy.filter(c => c !== column));
  };

  const addHavingCondition = () => {
    setHavingConditions([...havingConditions, {
      aggregation: "COUNT",
      column: "",
      operator: ">",
      value: "",
      logic: "AND"
    }]);
  };

  const removeHavingCondition = (idx) => {
    setHavingConditions(havingConditions.filter((_, i) => i !== idx));
  };

  const updateHavingCondition = (idx, field, value) => {
    const updated = [...havingConditions];
    updated[idx] = { ...updated[idx], [field]: value };
    setHavingConditions(updated);
  };

  const addOrderBy = () => {
    setOrderBy([...orderBy, { column: "", direction: "ASC" }]);
  };

  const removeOrderBy = (idx) => {
    setOrderBy(orderBy.filter((_, i) => i !== idx));
  };

  const updateOrderBy = (idx, field, value) => {
    const updated = [...orderBy];
    updated[idx] = { ...updated[idx], [field]: value };
    setOrderBy(updated);
  };

  const validateQuery = useCallback(() => {
    const errors = [];

    if (selectedTables.length === 0 || !selectedTables[0].id) {
      errors.push("Please select at least one table");
    }

    if (selectedTables.length > 1 && joins.length !== selectedTables.length - 1) {
      errors.push("Missing JOIN conditions for selected tables");
    }

    joins.forEach((join, idx) => {
      if (!join.leftColumn || !join.rightColumn) {
        errors.push(`JOIN ${idx + 1}: Please select both columns`);
      }
    });

    if (selectedColumns.length === 0 && customColumns.length === 0) {
      errors.push("Please select at least one column or add a custom expression.");
    }

    const hasAggregation = selectedColumns.some(c => c.aggregation);
    const hasNonAggregation = selectedColumns.some(c => !c.aggregation);

    if (hasAggregation && hasNonAggregation) {
      const nonAggregatedInSelect = selectedColumns
        .filter(c => !c.aggregation)
        .map(c => c.fullName);

      const missingInGroupBy = nonAggregatedInSelect.filter(c => !groupBy.includes(c));

      if (missingInGroupBy.length > 0) {
        errors.push(`Non-aggregated columns in SELECT must be in GROUP BY: ${missingInGroupBy.join(', ')}`);
      }
    }

    customColumns.forEach((cc, idx) => {
      if (!cc.expression) {
        errors.push(`Custom Expression ${idx + 1}: Expression cannot be empty.`);
      }
      if (!cc.alias) {
        errors.push(`Custom Expression ${idx + 1}: Alias cannot be empty.`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [selectedTables, joins, selectedColumns, groupBy, customColumns]);

  const generateQuery = useCallback(() => {
    if (!validateQuery()) {
      onQueryChange?.("");
      return;
    }

    try {
      // SELECT clause
      let sql = "SELECT ";
      if (distinct) sql += "DISTINCT ";

      const allColumnParts = [
        ...selectedColumns.map(col => {
          let part = "";
          if (col.aggregation) {
            part = `${col.aggregation}(${col.fullName})`;
          } else {
            part = col.fullName;
          }
          if (col.alias) {
            part += ` AS "${col.alias}"`; // Use double quotes for aliases
          }
          return part;
        }),
        ...customColumns.map(cc => `${cc.expression} AS "${cc.alias}"`) // Use double quotes for aliases
      ];

      sql += allColumnParts.length > 0 ? allColumnParts.join(", ") : "*";

      // FROM clause
      const firstTable = tables.find(t => t.id === selectedTables[0]?.id);
      if (!firstTable) return "";

      sql += `\nFROM ${firstTable.name}`;
      if (selectedTables[0].alias) {
        sql += ` AS ${selectedTables[0].alias}`;
      }

      // JOIN clauses
      joins.forEach((join, idx) => {
        const table = tables.find(t => t.id === selectedTables[idx + 1]?.id);
        if (table) {
          sql += `\n${join.type} ${table.name}`;
          if (selectedTables[idx + 1].alias) {
            sql += ` AS ${selectedTables[idx + 1].alias}`;
          }
          sql += ` ON ${join.leftColumn} ${join.operator} ${join.rightColumn}`;
        }
      });

      // WHERE clause
      const validConditions = conditions.filter(c =>
        c.column && (c.value !== "" || c.operator.includes("NULL"))
      );

      if (validConditions.length > 0) {
        sql += "\nWHERE ";
        validConditions.forEach((cond, idx) => {
          if (idx > 0) {
            sql += ` ${cond.logic} `;
          }

          if (cond.operator.includes("NULL")) {
            sql += `${cond.column} ${cond.operator}`;
          } else if (cond.operator === "IN" || cond.operator === "NOT IN") {
            const values = cond.value.split(',').map(v => `'${v.trim()}'`).join(', ');
            sql += `${cond.column} ${cond.operator} (${values})`;
          } else {
            const val = typeof cond.value === "number"
              ? cond.value
              : `'${String(cond.value).replace(/'/g, "''")}'`;
            sql += `${cond.column} ${cond.operator} ${val}`;
          }
        });
      }

      // GROUP BY clause
      if (groupBy.length > 0) {
        sql += `\nGROUP BY ${groupBy.join(", ")}`;
      }

      // HAVING clause
      const validHaving = havingConditions.filter(h => h.column && h.value);
      if (validHaving.length > 0) {
        sql += "\nHAVING ";
        validHaving.forEach((hav, idx) => {
          if (idx > 0) {
            sql += ` ${hav.logic} `;
          }
          sql += `${hav.aggregation}(${hav.column}) ${hav.operator} ${hav.value}`;
        });
      }

      // ORDER BY clause
      const validOrderBy = orderBy.filter(o => o.column);
      if (validOrderBy.length > 0) {
        sql += "\nORDER BY ";
        sql += validOrderBy.map(o => `${o.column} ${o.direction}`).join(", ");
      }

      // LIMIT and OFFSET
      if (limit) {
        sql += `\nLIMIT ${limit}`;
      }
      if (offset) {
        sql += ` OFFSET ${offset}`;
      }

      sql += ";";
      onQueryChange?.(sql);
    } catch (error) {
      console.error("Error generating query:", error);
      onQueryChange?.("");
    }
  }, [
    selectedTables,
    selectedColumns,
    customColumns,
    joins,
    conditions,
    groupBy,
    havingConditions,
    orderBy,
    limit,
    offset,
    distinct,
    tables,
    onQueryChange,
    validateQuery
  ]);

  useEffect(() => {
    generateQuery();
  }, [generateQuery]);

  const allColumns = getAllColumns();
  const allSortableColumns = [
    ...allColumns.map(c => ({ value: c.fullName, label: c.fullName })),
    ...selectedColumns.filter(c => c.alias).map(c => ({ value: `"${c.alias}"`, label: `Alias: ${c.alias}` })),
    ...customColumns.filter(c => c.alias).map(c => ({ value: `"${c.alias}"`, label: `Custom: ${c.alias}` }))
  ];

  return (
    <div className="space-y-4">
      <QueryPlanVisualizer
        tables={selectedTables}
        joins={joins}
        conditions={conditions}
        groupBy={groupBy}
        having={havingConditions}
        selectedColumns={selectedColumns}
        customColumns={customColumns}
        orderBy={orderBy}
        limit={limit}
      />
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Query validation errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="multiple" defaultValue={["tables", "columns"]} className="w-full space-y-2">
        {/* Step 1: Select Tables */}
        <AccordionItem value="tables" className="border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Select Tables</div>
                <div className="text-xs text-slate-500">
                  Choose one or more tables to query from
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {selectedTables.map((st, idx) => (
                <div key={idx}>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Table</Label>
                      <Select
                        value={st.id}
                        onValueChange={(v) => updateTable(idx, "id", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Alias (optional)</Label>
                      <Input
                        placeholder="e.g., u, orders"
                        value={st.alias}
                        onChange={(e) => updateTable(idx, "alias", e.target.value)}
                      />
                    </div>
                    {idx > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTable(idx)}
                        className="mt-5"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* JOIN configuration */}
                  {idx > 0 && (
                    <Card className="mt-3 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                            JOIN Configuration
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                          <div className="md:col-span-1">
                            <Select
                              value={joins[idx - 1]?.type}
                              onValueChange={(v) => updateJoin(idx - 1, "type", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="JOIN type" />
                              </SelectTrigger>
                              <SelectContent>
                                {JOIN_TYPES.map((jt) => (
                                  <SelectItem key={jt.value} value={jt.value}>
                                    {jt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-3 grid grid-cols-3 gap-2 items-center">
                            <Select
                              value={joins[idx - 1]?.leftColumn}
                              onValueChange={(v) => updateJoin(idx - 1, "leftColumn", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Left column" />
                              </SelectTrigger>
                              <SelectContent>
                                {allColumns
                                  .filter(c => c.tableIndex < idx)
                                  .map((col) => (
                                    <SelectItem key={col.fullName} value={col.fullName}>
                                      {col.fullName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={joins[idx - 1]?.operator}
                              onValueChange={(v) => updateJoin(idx - 1, "operator", v)}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {JOIN_OPERATORS.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={joins[idx - 1]?.rightColumn}
                              onValueChange={(v) => updateJoin(idx - 1, "rightColumn", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Right column" />
                              </SelectTrigger>
                              <SelectContent>
                                {allColumns
                                  .filter(c => c.tableIndex === idx)
                                  .map((col) => (
                                    <SelectItem key={col.fullName} value={col.fullName}>
                                      {col.fullName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addTable}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Table (for JOIN)
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 2: Select Columns */}
        <AccordionItem value="columns" className="border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Select Columns</div>
                <div className="text-xs text-slate-500">
                  Choose columns to include in results ({selectedColumns.length + customColumns.length} selected)
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={distinct} onCheckedChange={setDistinct} />
                  <Label className="text-sm">DISTINCT (remove duplicates)</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSelectedColumns([]); setCustomColumns([]); }}>
                  Deselect All
                </Button>
              </div>

              <Separator className="dark:bg-slate-700" />

              <div>
                <Label className="font-semibold text-slate-800 dark:text-slate-200">Table Columns</Label>
                <div className="space-y-3 mt-2">
                  {allColumns.length > 0 ? (
                    allColumns.map((col) => {
                      const isSelected = selectedColumns.find(c => c.fullName === col.fullName);
                      const selectedCol = selectedColumns.find(c => c.fullName === col.fullName);

                      return (
                        <div key={col.fullName} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer hover:bg-slate-100 flex-1"
                              onClick={() => toggleColumn(col)}
                            >
                              <span className="text-xs font-mono">{col.fullName}</span>
                              <span className="ml-2 text-xs opacity-70">({col.columnType})</span>
                            </Badge>
                          </div>

                          {isSelected && (
                            <div className="ml-4 grid grid-cols-2 gap-2">
                              <Select
                                value={selectedCol?.aggregation || "none"}
                                onValueChange={(v) =>
                                  updateColumnAggregation(col.fullName, v === "none" ? null : v)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="No aggregation" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No aggregation</SelectItem>
                                  {AGGREGATION_FUNCTIONS.map((fn) => (
                                    <SelectItem key={fn.value} value={fn.value}>
                                      {fn.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Alias (optional)"
                                value={selectedCol?.alias || ""}
                                onChange={(e) => updateColumnAlias(col.fullName, e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Select a table first to see available columns
                    </p>
                  )}
                </div>
              </div>

              <Separator className="dark:bg-slate-700" />

              <div>
                <Label className="font-semibold text-slate-800 dark:text-slate-200">Custom Expressions</Label>
                <div className="space-y-3 mt-2">
                  {customColumns.map((cc, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Expression (e.g., price * 1.1)"
                          value={cc.expression}
                          onChange={(e) => updateCustomColumn(idx, "expression", e.target.value)}
                        />
                        <Input
                          placeholder="Alias (e.g., price_with_tax)"
                          value={cc.alias}
                          onChange={(e) => updateCustomColumn(idx, "alias", e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCustomColumn(idx)}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomColumn}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Expression
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 3: Add Filters (WHERE) */}
        <AccordionItem value="conditions" className="border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Add Filters (WHERE)</div>
                <div className="text-xs text-slate-500">
                  Filter rows based on conditions
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {conditions.map((cond, idx) => (
                <div key={idx} className="space-y-2">
                  {idx > 0 && (
                    <Select
                      value={cond.logic}
                      onValueChange={(v) => updateCondition(idx, "logic", v)}
                    >
                      <SelectTrigger className="w-24 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Select
                        value={cond.column}
                        onValueChange={(v) => updateCondition(idx, "column", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Column" />
                        </SelectTrigger>
                        <SelectContent>
                          {allColumns.map((col) => (
                            <SelectItem key={col.fullName} value={col.fullName}>
                              {col.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Select
                        value={cond.operator}
                        onValueChange={(v) => updateCondition(idx, "operator", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-4">
                      {!cond.operator.includes("NULL") && (
                        <Input
                          placeholder={cond.operator.includes("IN") ? "val1, val2, val3" : "Value"}
                          value={cond.value}
                          onChange={(e) => updateCondition(idx, "value", e.target.value)}
                        />
                      )}
                    </div>

                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(idx)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addCondition}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 4: Group & Aggregate */}
        <AccordionItem value="grouping" className="border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">4</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Group & Aggregate</div>
                <div className="text-xs text-slate-500">
                  Group rows and add aggregation filters
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {/* GROUP BY */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">GROUP BY Columns</Label>
                <div className="space-y-2">
                  {selectedColumns
                    .filter(c => !c.aggregation)
                    .map((col) => (
                      <div key={col.fullName} className="flex items-center gap-2">
                        <Badge
                          variant={groupBy.includes(col.fullName) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-slate-100 flex-1"
                          onClick={() =>
                            groupBy.includes(col.fullName)
                              ? removeGroupBy(col.fullName)
                              : addGroupBy(col.fullName)
                          }
                        >
                          {col.fullName}
                        </Badge>
                      </div>
                    ))}
                  {selectedColumns.filter(c => !c.aggregation).length === 0 && (
                    <p className="text-xs text-slate-500">
                      Select non-aggregated columns in Step 2 to enable GROUP BY.
                    </p>
                  )}
                </div>
              </div>

              <Separator className="dark:bg-slate-700" />

              {/* HAVING */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">HAVING Conditions</Label>
                <div className="space-y-2">
                  {havingConditions.map((hav, idx) => (
                    <div key={idx} className="space-y-2">
                      {idx > 0 && (
                        <Select
                          value={hav.logic}
                          onValueChange={(v) => updateHavingCondition(idx, "logic", v)}
                        >
                          <SelectTrigger className="w-24 h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Select
                            value={hav.aggregation}
                            onValueChange={(v) => updateHavingCondition(idx, "aggregation", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGGREGATION_FUNCTIONS.map((fn) => (
                                <SelectItem key={fn.value} value={fn.value}>
                                  {fn.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Select
                            value={hav.column}
                            onValueChange={(v) => updateHavingCondition(idx, "column", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              {allColumns.map((col) => (
                                <SelectItem key={col.fullName} value={col.fullName}>
                                  {col.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Select
                            value={hav.operator}
                            onValueChange={(v) => updateHavingCondition(idx, "operator", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">=</SelectItem>
                              <SelectItem value="!=">!=</SelectItem>
                              <SelectItem value=">">&gt;</SelectItem>
                              <SelectItem value="<">&lt;</SelectItem>
                              <SelectItem value=">=">&gt;=</SelectItem>
                              <SelectItem value="<=">&lt;=</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Value"
                            value={hav.value}
                            onChange={(e) => updateHavingCondition(idx, "value", e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHavingCondition(idx)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addHavingCondition}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add HAVING Condition
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 5: Sort & Limit */}
        <AccordionItem value="sorting" className="border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-pink-600">5</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Sort & Limit</div>
                <div className="text-xs text-slate-500">
                  Order results and limit number of rows
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {/* ORDER BY */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">ORDER BY</Label>
                <div className="space-y-2">
                  {orderBy.map((ord, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <Select
                          value={ord.column}
                          onValueChange={(v) => updateOrderBy(idx, "column", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Column" />
                          </SelectTrigger>
                          <SelectContent>
                            {allSortableColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={ord.direction}
                          onValueChange={(v) => updateOrderBy(idx, "direction", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASC">ASC ↑</SelectItem>
                            <SelectItem value="DESC">DESC ↓</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrderBy(idx)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOrderBy}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sort Column
                  </Button>
                </div>
              </div>

              <Separator className="dark:bg-slate-700" />

              {/* LIMIT & OFFSET */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1 block">LIMIT</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">OFFSET</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 0"
                    value={offset}
                    onChange={(e) => setOffset(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
