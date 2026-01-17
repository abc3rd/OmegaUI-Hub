import React, { useState, useEffect } from 'react';
import { DiffSession } from "@/entities/DiffSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await DiffSession.list('-created_date');
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await DiffSession.delete(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session deleted successfully');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handleExport = (session) => {
    const exportData = {
      name: session.name,
      created_date: session.created_date,
      left_code: session.left_code,
      right_code: session.right_code,
      left_language: session.left_language,
      right_language: session.right_language
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Session exported successfully');
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.left_language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.right_language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-white">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Saved Sessions</h1>
            <p className="text-slate-400 mt-2">Manage your saved diff sessions and code comparisons</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('DiffChecker'))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Session
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions by name or language..."
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-slate-400 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                <p>{searchTerm ? 'Try adjusting your search terms' : 'Create your first diff session to get started'}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{session.name}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(session.created_date), 'MMM d, yyyy')}
                      </span>
                      <div className="flex gap-2">
                        {session.left_language && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
                            {session.left_language}
                          </Badge>
                        )}
                        {session.right_language && (
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500">
                            {session.right_language}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(session)}
                      className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      className="bg-red-900/20 border-red-700 text-red-400 hover:bg-red-900/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Left Code ({session.left_code?.split('\n').length || 0} lines)</p>
                      <div className="bg-slate-950 rounded p-2 font-mono text-xs text-slate-300 overflow-hidden">
                        {session.left_code?.substring(0, 100) || 'No code'}
                        {session.left_code?.length > 100 && '...'}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Right Code ({session.right_code?.split('\n').length || 0} lines)</p>
                      <div className="bg-slate-950 rounded p-2 font-mono text-xs text-slate-300 overflow-hidden">
                        {session.right_code?.substring(0, 100) || 'No code'}
                        {session.right_code?.length > 100 && '...'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}