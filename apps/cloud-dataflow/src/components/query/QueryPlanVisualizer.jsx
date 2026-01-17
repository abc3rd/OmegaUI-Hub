import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Table2,
  GitMerge,
  Filter,
  Layers,
  ListOrdered,
  Pointer,
  ChevronRight,
  Database
} from "lucide-react";

const PlanNode = ({ icon: Icon, title, content, isEnabled }) => {
  if (!isEnabled) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 w-28">
        <div className="flex flex-col items-center p-2 border bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow-sm">
          <Icon className="w-5 h-5 mb-1 text-blue-600 dark:text-blue-400" />
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{title}</div>
        </div>
      </div>
      <div className="flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md text-xs text-slate-600 dark:text-slate-400 min-w-0">
        {content}
      </div>
    </div>
  );
};

const Arrow = () => (
  <div className="flex justify-center items-center h-6">
    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
  </div>
);

export default function QueryPlanVisualizer({
  tables,
  joins,
  conditions,
  groupBy,
  having,
  selectedColumns,
  customColumns,
  orderBy,
  limit
}) {
  const hasTables = tables?.length > 0 && tables[0]?.id;
  const hasJoins = joins?.length > 0 && joins[0]?.leftColumn;
  const hasConditions = conditions?.length > 0 && conditions[0]?.column;
  const hasGroupBy = groupBy?.length > 0;
  const hasHaving = hasHaving?.length > 0 && hasHaving[0]?.column;
  const hasSelect = selectedColumns?.length > 0 || customColumns?.length > 0;
  const hasOrderBy = orderBy?.length > 0 && orderBy[0]?.column;
  const hasLimit = !!limit;

  if (!hasTables) {
    return (
      <div className="p-4 border-2 border-dashed dark:border-slate-700 rounded-lg text-center text-sm text-slate-500 dark:text-slate-400">
        <Database className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        Your query plan will appear here as you build it. Start by selecting a table.
      </div>
    );
  }

  return (
    <div className="p-4 border dark:border-slate-700 rounded-lg space-y-2 bg-slate-100/50 dark:bg-slate-900/50">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Query Execution Plan</h3>
      <div className="space-y-1">
        <PlanNode
          icon={Table2}
          title="FROM"
          content={
            <div className="truncate">
              {tables.map(t => (t.name || '...')).join(', ')}
            </div>
          }
          isEnabled={hasTables}
        />
        {hasJoins && <Arrow />}
        <PlanNode
          icon={GitMerge}
          title="JOIN"
          content={`${joins.length} join(s) defined`}
          isEnabled={hasJoins}
        />
        {hasConditions && <Arrow />}
        <PlanNode
          icon={Filter}
          title="WHERE"
          content={`${conditions.filter(c=>c.column).length} condition(s)`}
          isEnabled={hasConditions}
        />
        {hasGroupBy && <Arrow />}
        <PlanNode
          icon={Layers}
          title="GROUP BY"
          content={
            <div className="flex flex-wrap gap-1">
              {groupBy.map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
            </div>
          }
          isEnabled={hasGroupBy}
        />
        {hasHaving && <Arrow />}
         <PlanNode
          icon={Filter}
          title="HAVING"
          content={`${having.filter(h=>h.column).length} condition(s)`}
          isEnabled={hasHaving}
        />
        {(hasSelect || hasOrderBy || hasLimit) && <Arrow />}
        <PlanNode
          icon={Pointer}
          title="SELECT"
          content={`${selectedColumns.length} table column(s), ${customColumns.length} custom expression(s)`}
          isEnabled={hasSelect}
        />
        {hasOrderBy && <Arrow />}
        <PlanNode
          icon={ListOrdered}
          title="ORDER BY"
          content={`${orderBy.length} sort rule(s)`}
          isEnabled={hasOrderBy}
        />
      </div>
    </div>
  );
}