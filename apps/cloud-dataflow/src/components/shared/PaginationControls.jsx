import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function PaginationControls({
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageSize,
  itemCount
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t dark:border-slate-700">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing{' '}
        <strong>
          {pageIndex * pageSize + 1}-
          {Math.min((pageIndex + 1) * pageSize, itemCount)}
        </strong>{' '}
        of <strong>{itemCount}</strong> results
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder={`${pageSize} rows`} />
          </SelectTrigger>
          <SelectContent side="top">
            {[25, 50, 100, 250, 500].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}