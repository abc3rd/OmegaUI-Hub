import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  History, Search, Copy, CheckCircle2, ExternalLink, Cloud, QrCode, 
  Trash2, ChevronDown, ChevronUp, FileText, ArrowUpDown, CalendarIcon,
  Download, X, Loader2, Sparkles, Eye
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { format } from 'date-fns';
import SummaryModal from './SummaryModal';

export default function FileTransferHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summarizingId, setSummarizingId] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['fileTransfers'],
    queryFn: () => base44.entities.FileTransfer.list('-created_date', 100),
    initialData: []
  });

  const { data: summaries } = useQuery({
    queryKey: ['fileSummaries'],
    queryFn: () => base44.entities.FileSummary.list('-created_date', 100),
    initialData: []
  });

  // Map summaries by file_transfer_id for quick lookup
  const summaryMap = useMemo(() => {
    const map = {};
    summaries.forEach(s => {
      map[s.file_transfer_id] = s;
    });
    return map;
  }, [summaries]);

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.FileTransfer.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileTransfers'] });
      setSelectedIds([]);
    }
  });

  const filteredAndSortedTransfers = useMemo(() => {
    let result = transfers.filter(transfer => {
      // Text search
      const matchesSearch = !searchQuery || 
        transfer.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.file_url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = filterType === 'all' || transfer.transfer_type === filterType;
      
      // Date range filter
      const transferDate = new Date(transfer.created_date);
      const matchesDateFrom = !dateFrom || transferDate >= dateFrom;
      const matchesDateTo = !dateTo || transferDate <= new Date(dateTo.getTime() + 86400000);
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'date_asc':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'name_asc':
          return (a.file_name || '').localeCompare(b.file_name || '');
        case 'name_desc':
          return (b.file_name || '').localeCompare(a.file_name || '');
        case 'size_desc':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'size_asc':
          return (a.file_size || 0) - (b.file_size || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [transfers, searchQuery, filterType, sortBy, dateFrom, dateTo]);

  const copyToClipboard = async (url, id) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedTransfers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedTransfers.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} file(s) from history?`)) return;
    
    setIsDeleting(true);
    await deleteMutation.mutateAsync(selectedIds);
    setIsDeleting(false);
  };

  const downloadChunkedFile = async (transfer) => {
    if (!transfer.chunk_urls || transfer.chunk_urls.length <= 1) {
      window.open(transfer.file_url, '_blank');
      return;
    }
    
    // For chunked files, download all chunks
    for (let i = 0; i < transfer.chunk_urls.length; i++) {
      const link = document.createElement('a');
      link.href = transfer.chunk_urls[i];
      link.download = `${transfer.file_name}.part${i}`;
      link.click();
      await new Promise(r => setTimeout(r, 500)); // Delay between downloads
    }
  };

  const handleSummarize = async (transfer) => {
    setSummarizingId(transfer.id);
    try {
      // Fetch file content if it's a text file
      let fileContent = null;
      if (transfer.file_url) {
        try {
          const response = await fetch(transfer.file_url);
          fileContent = await response.text();
        } catch (e) {
          console.log('Could not fetch file content, will try URL on backend');
        }
      }

      const { data } = await base44.functions.invoke('summarizeFile', {
        fileTransferId: transfer.id,
        fileContent,
        force: false
      });

      queryClient.invalidateQueries({ queryKey: ['fileSummaries'] });
      setSelectedSummary(data);
      setSummaryModalOpen(true);
    } catch (error) {
      console.error('Summarization failed:', error);
      alert('Summarization failed: ' + (error.message || 'Unknown error'));
    } finally {
      setSummarizingId(null);
    }
  };

  const handleViewSummary = (summary) => {
    setSelectedSummary(summary);
    setSummaryModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortBy('date_desc');
    setDateFrom(null);
    setDateTo(null);
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || dateFrom || dateTo || sortBy !== 'date_desc';

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <History className="w-5 h-5 text-purple-400" />
            Transfer History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-700 text-slate-300 border-slate-600">
              {filteredAndSortedTransfers.length}/{transfers.length} files
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-slate-400"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {!isExpanded && transfers.length > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            Last upload: {transfers[0]?.file_name} ({moment(transfers[0]?.created_date).fromNow()})
          </div>
        )}
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-2 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file name or URL..."
                  className="pl-9 bg-slate-900/50 border-slate-600 text-slate-100 h-9"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2">
                {/* Type Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-28 bg-slate-900/50 border-slate-600 text-slate-100 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600 text-slate-100 h-8 text-xs">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                    <SelectItem value="size_desc">Largest</SelectItem>
                    <SelectItem value="size_asc">Smallest</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 px-2 bg-slate-900/50 border-slate-600 text-slate-300 text-xs">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {dateFrom ? format(dateFrom, 'MMM d') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Date To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 px-2 bg-slate-900/50 border-slate-600 text-slate-300 text-xs">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {dateTo ? format(dateTo, 'MMM d') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Batch Actions */}
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                >
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {selectedIds.length} selected
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="h-7 text-xs"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                    className="h-7 text-xs text-slate-400"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}

              {/* Select All */}
              {filteredAndSortedTransfers.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Checkbox
                    checked={selectedIds.length === filteredAndSortedTransfers.length && filteredAndSortedTransfers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-slate-600"
                  />
                  <span>Select all</span>
                </div>
              )}

              {/* Transfer List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 bg-slate-700/50" />
                  ))
                ) : filteredAndSortedTransfers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {hasActiveFilters ? 'No matching transfers' : 'No transfers yet'}
                    </p>
                  </div>
                ) : (
                  filteredAndSortedTransfers.map((transfer) => (
                    <motion.div
                      key={transfer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 bg-slate-900/50 rounded-lg border transition-colors ${
                        selectedIds.includes(transfer.id) 
                          ? 'border-purple-500/50 bg-purple-500/5' 
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedIds.includes(transfer.id)}
                          onCheckedChange={() => toggleSelect(transfer.id)}
                          className="border-slate-600 mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {transfer.transfer_type === 'qr' ? (
                              <QrCode className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            ) : (
                              <Cloud className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            )}
                            <span className="font-medium text-slate-200 truncate text-sm">
                              {transfer.file_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{moment(transfer.created_date).format('MMM D, h:mm A')}</span>
                            <span>•</span>
                            <span>{formatFileSize(transfer.file_size)}</span>
                            {transfer.chunks_count > 1 && (
                              <>
                                <span>•</span>
                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs h-5">
                                  {transfer.chunks_count} chunks
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Summarize / View Summary Button */}
                          {summaryMap[transfer.id]?.status === 'ready' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewSummary(summaryMap[transfer.id])}
                              className="h-7 px-2 text-green-400 hover:text-green-300 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSummarize(transfer)}
                              disabled={summarizingId === transfer.id}
                              className="h-7 px-2 text-purple-400 hover:text-purple-300 text-xs"
                            >
                              {summarizingId === transfer.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                              )}
                              {summarizingId === transfer.id ? 'Processing...' : 'Summarize'}
                            </Button>
                          )}
                          {transfer.chunks_count > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => downloadChunkedFile(transfer)}
                              className="h-7 w-7 text-slate-400 hover:text-white"
                              title="Download all chunks"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(transfer.file_url, transfer.id)}
                            className="h-7 w-7 text-slate-400 hover:text-white"
                          >
                            {copiedId === transfer.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(transfer.file_url, '_blank')}
                            className="h-7 w-7 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 ml-6 p-1.5 bg-slate-800/50 rounded text-xs font-mono text-cyan-400 truncate">
                        {transfer.file_url}
                      </div>
                      
                      {/* Summary Preview Badge */}
                      {summaryMap[transfer.id]?.status === 'ready' && (
                        <div className="mt-2 ml-6 flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Summarized
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {summaryMap[transfer.id].savings_percentage}% token savings
                          </span>
                        </div>
                      )}
                      {summaryMap[transfer.id]?.status === 'processing' && (
                        <div className="mt-2 ml-6">
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing...
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={selectedSummary}
      />
    </Card>
  );
}