import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music, 
  FileText, 
  Trash2, 
  Search, 
  Filter,
  Clock,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: trainingData = [], isLoading } = useQuery({
    queryKey: ['trainingData'],
    queryFn: () => base44.entities.TrainingData.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingData.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingData']);
      toast.success("Training data deleted");
      setDeleteId(null);
    },
  });

  const filteredData = trainingData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: trainingData.length,
    audio: trainingData.filter(d => d.type === 'audio').length,
    text: trainingData.filter(d => d.type === 'text' || d.type === 'document').length,
    totalMinutes: trainingData.reduce((sum, d) => sum + (d.duration_minutes || 0), 0),
    totalWords: trainingData.reduce((sum, d) => sum + (d.word_count || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Training Library</h1>
          <p className="text-slate-400">
            Manage all your training data
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-6">
              <Music className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.audio}</p>
              <p className="text-sm text-slate-400">Audio Files</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.text}</p>
              <p className="text-sm text-slate-400">Text Files</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-orange-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalMinutes}m</p>
              <p className="text-sm text-slate-400">Audio Duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or tags..."
                  className="pl-10 bg-slate-950 border-slate-700 text-white"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList className="bg-slate-950">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="document">Documents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Data Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="text-slate-400 mt-4">Loading your data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-12 text-center">
              <Filter className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No training data found</p>
              <p className="text-slate-600 text-sm">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        item.type === 'audio' ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}>
                        {item.type === 'audio' ? (
                          <Music className="w-6 h-6 text-blue-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h3 className="text-white font-semibold mb-2 truncate">{item.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      {item.type === 'audio' && item.duration_minutes && (
                        <span>{item.duration_minutes} min</span>
                      )}
                      {item.word_count && (
                        <span>{item.word_count.toLocaleString()} words</span>
                      )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <Badge className={
                        item.processing_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.processing_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      }>
                        {item.processing_status}
                      </Badge>
                      {item.file_url && (
                        <a 
                          href={item.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white text-sm"
                        >
                          View file →
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Training Data?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete this training data from your library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white border-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}