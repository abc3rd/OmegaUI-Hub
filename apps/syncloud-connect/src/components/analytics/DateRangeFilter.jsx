import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

const presets = [
  { label: 'Last 7 days', value: '7d', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: '30d', getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 90 days', value: '90d', getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: 'This month', value: 'month', getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'This year', value: 'year', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: 'Custom', value: 'custom', getRange: () => null },
];

export default function DateRangeFilter({ dateRange, onDateRangeChange }) {
  const [preset, setPreset] = useState('30d');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (value) => {
    setPreset(value);
    if (value === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      const selectedPreset = presets.find(p => p.value === value);
      if (selectedPreset) {
        onDateRangeChange(selectedPreset.getRange());
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-white dark:bg-slate-900">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange?.from}
                onSelect={(date) => onDateRangeChange({ ...dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-slate-400">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-white dark:bg-slate-900">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange?.to}
                onSelect={(date) => onDateRangeChange({ ...dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}