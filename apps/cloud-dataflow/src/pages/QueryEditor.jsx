import React, { useState, useEffect, useCallback } from "react";
import { Database as DatabaseEntity, Query } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Save,
  Database,
  Code,
  Loader2,
  RefreshCw,
  Pause,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import QueryResults from "../components/query/QueryResults";
import QueryHistory from "../components/query/QueryHistory";
import VisualQueryBuilder from "../components/query/VisualQueryBuilder";

const REFRESH_INTERVALS = [
  { label: "5 seconds", value: 5000 },
  { label: "15 seconds", value: 15000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "5 minutes", value: 300000 }
];

export default function QueryEditor() {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [queryResults, setQueryResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("sql");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(15000);
  const [isPaused, setIsPaused] = useState(false);
  const [lastExecuted, setLastExecuted] = useState(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(null);

  const loadDatabases = async () => {
    try {
      const data = await DatabaseEntity.list();
      setDatabases(data.filter(db => db.status === 'active'));
      if (data.length > 0) {
        setSelectedDatabase(prevDb => prevDb || data[0].id);
      }
    } catch (error) {
      console.error("Error loading databases:", error);
    }
  };

  const loadQueryHistory = useCallback(async () => {
    try {
      const data = await Query.list('-created_date', 10);
      setQueryHistory(data);
    } catch (error) {
      console.error("Error loading query history:", error);
    }
  }, []);

  const executeQuery = useCallback(async (isAutoRefresh = false) => {
    if (!sqlQuery.trim() || !selectedDatabase) return;

    setIsExecuting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, isAutoRefresh ? 800 : 1500));

      const baseData = [
        [1, 'John Doe', 'john@example.com', '2024-01-01'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-02'],
        [3, 'Bob Wilson', 'bob@example.com', '2024-01-03'],
      ];

      if (isAutoRefresh && Math.random() > 0.5) {
        baseData.push([
          baseData.length + 1,
          'New User',
          `user${Date.now()}@example.com`,
          new Date().toISOString().split('T')[0]
        ]);
      }

      const mockResults = {
        columns: ['id', 'name', 'email', 'created_at'],
        rows: baseData,
        executionTime: Math.floor(Math.random() * 500) + 50,
        rowCount: baseData.length,
        timestamp: new Date().toISOString()
      };

      setQueryResults(mockResults);
      setLastExecuted(new Date());

      if (!isAutoRefresh) {
        await Query.create({
          database_id: selectedDatabase,
          name: `Query ${Date.now()}`,
          sql_query: sqlQuery,
          query_type: sqlQuery.trim().toUpperCase().split(' ')[0],
          execution_time: mockResults.executionTime,
          result_count: mockResults.rowCount,
          last_executed: new Date().toISOString()
        });

        await loadQueryHistory();
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
    setIsExecuting(false);
  }, [selectedDatabase, sqlQuery, loadQueryHistory]);

  const saveQuery = async () => {
    if (!sqlQuery.trim() || !selectedDatabase) return;

    try {
      await Query.create({
        database_id: selectedDatabase,
        name: `Saved Query ${Date.now()}`,
        sql_query: sqlQuery,
        query_type: sqlQuery.trim().toUpperCase().split(' ')[0],
        is_saved: true
      });
      await loadQueryHistory();
    } catch (error) {
      console.error("Error saving query:", error);
    }
  };

  useEffect(() => {
    loadDatabases();
    loadQueryHistory();
  }, [loadQueryHistory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get("db");
    if (dbParam) setSelectedDatabase(dbParam);
  }, []);

  useEffect(() => {
    if (!autoRefresh || isPaused || !queryResults) return;

    const intervalId = setInterval(() => {
      executeQuery(true);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, isPaused, queryResults, refreshInterval, executeQuery]);

  useEffect(() => {
    if (!autoRefresh || isPaused || !lastExecuted) {
      setNextRefreshIn(null);
      return;
    }

    const countdownInterval = setInterval(() => {
      const now = Date.now();
      const nextRefresh = lastExecuted.getTime() + refreshInterval;
      const remaining = Math.max(0, Math.ceil((nextRefresh - now) / 1000));
      setNextRefreshIn(remaining);

      if (remaining === 0) {
        setNextRefreshIn(refreshInterval / 1000);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [autoRefresh, isPaused, lastExecuted, refreshInterval]);

  const toggleAutoRefresh = () => {
    if (!autoRefresh) {
      setLastExecuted(new Date());
    }
    setAutoRefresh(!autoRefresh);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Query Editor</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Execute SQL queries and build visual queries</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${autoRefresh && !isPaused ? 'text-green-600 animate-spin' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-refresh</span>
                  <Switch checked={autoRefresh} onCheckedChange={toggleAutoRefresh} />
                </div>
                
                {autoRefresh && (
                  <>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                    <Select 
                      value={refreshInterval.toString()} 
                      onValueChange={(v) => setRefreshInterval(parseInt(v))}
                      disabled={!autoRefresh}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REFRESH_INTERVALS.map(interval => (
                          <SelectItem key={interval.value} value={interval.value.toString()}>
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={togglePause}
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </Button>

                    {nextRefreshIn !== null && !isPaused && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Next: {nextRefreshIn}s
                      </Badge>
                    )}

                    {isPaused && (
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 text-xs">
                        Paused
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="border-slate-300 dark:border-slate-600" onClick={saveQuery}>
            <Save className="w-4 h-4 mr-2" />
            Save Query
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => executeQuery(false)}
            disabled={isExecuting || !sqlQuery.trim()}
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isExecuting ? 'Executing...' : 'Execute Now'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  Database Connection
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    Connected
                  </Badge>
                  {lastExecuted && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs">
                      Last: {formatTimeAgo(lastExecuted)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a database" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                Query Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="sql" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">SQL Editor</TabsTrigger>
                  <TabsTrigger value="visual" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Visual Builder</TabsTrigger>
                </TabsList>
                <TabsContent value="sql" className="mt-6">
                  <Textarea
                    placeholder="Enter your SQL query..."
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="min-h-[200px] font-mono text-sm border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                  />
                </TabsContent>
                <TabsContent value="visual" className="mt-6">
                  <VisualQueryBuilder onQueryChange={setSqlQuery} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {queryResults && (
            <QueryResults 
              results={queryResults} 
              isRefreshing={isExecuting && autoRefresh}
              autoRefreshEnabled={autoRefresh}
            />
          )}
        </div>

        <div className="space-y-6">
          <QueryHistory
            queries={queryHistory}
            onQuerySelect={(query) => setSqlQuery(query.sql_query)}
          />
        </div>
      </div>
    </div>
  );
}