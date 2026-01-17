import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Circle,
  Eye,
  TrendingUp,
  Target,
  ArrowRight,
  Folder,
  AlertTriangle
} from "lucide-react";
import { isPast, isToday, differenceInDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ProgressBar, { CircularProgress } from "../components/progress/ProgressBar";
import { calculateProgressStats } from "../components/progress/BoardProgressCard";

const Board = base44.entities.Board;
const Item = base44.entities.Item;

export default function ProgressPage() {
  const [boards, setBoards] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [boardsData, itemsData] = await Promise.all([
      Board.list("-updated_date"),
      Item.list("-updated_date")
    ]);
    setBoards(boardsData);
    setItems(itemsData);
    setIsLoading(false);
  };

  // Calculate overall stats
  const overallStats = calculateProgressStats(items);

  // Group items by board
  const boardsWithProgress = boards.map(board => {
    const boardItems = items.filter(item => item.board_id === board.id);
    const stats = calculateProgressStats(boardItems);
    return { ...board, items: boardItems, stats };
  });

  // Filter and sort boards
  const filteredBoards = boardsWithProgress
    .filter(board => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!board.title.toLowerCase().includes(query)) return false;
      }
      if (statusFilter === "completed" && board.stats.completionRate !== 100) return false;
      if (statusFilter === "in_progress" && (board.stats.completionRate === 0 || board.stats.completionRate === 100)) return false;
      if (statusFilter === "not_started" && board.stats.completionRate !== 0) return false;
      if (statusFilter === "overdue" && board.stats.overdue === 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "progress") return b.stats.completionRate - a.stats.completionRate;
      if (sortBy === "tasks") return b.stats.total - a.stats.total;
      if (sortBy === "overdue") return b.stats.overdue - a.stats.overdue;
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return 0;
    });

  // Get items that need attention
  const overdueItems = items.filter(item => {
    const status = item.status || item.data?.status;
    const dueDate = item.due_date || item.data?.due_date;
    if (!dueDate || status === 'done') return false;
    const due = new Date(dueDate);
    return isPast(due) && !isToday(due);
  });

  const dueSoonItems = items.filter(item => {
    const status = item.status || item.data?.status;
    const dueDate = item.due_date || item.data?.due_date;
    if (!dueDate || status === 'done') return false;
    const due = new Date(dueDate);
    if (isPast(due) && !isToday(due)) return false;
    return differenceInDays(due, new Date()) <= 3;
  });

  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Progress Tracking</h1>
              <p className="text-gray-500 text-sm">Monitor all your projects and tasks</p>
            </div>
          </div>
          <Link to={createPageUrl("Boards")}>
            <Button variant="outline" className="border-gray-200">
              <Folder className="w-4 h-4 mr-2" />
              View Boards
            </Button>
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Overall Progress</h2>
                  <p className="text-sm text-gray-500">{overallStats.total} total tasks across {boards.length} boards</p>
                </div>
                <CircularProgress 
                  progress={overallStats.completionRate}
                  size={90}
                  strokeWidth={10}
                  status={overallStats.completionRate === 100 ? "done" : "in_progress"}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  icon={Circle}
                  label="To Do"
                  value={overallStats.todo}
                  color="slate"
                />
                <StatCard 
                  icon={Clock}
                  label="In Progress"
                  value={overallStats.inProgress}
                  color="blue"
                />
                <StatCard 
                  icon={Eye}
                  label="In Review"
                  value={overallStats.review}
                  color="amber"
                />
                <StatCard 
                  icon={CheckCircle2}
                  label="Done"
                  value={overallStats.done}
                  color="emerald"
                />
              </div>

              {overallStats.blocked > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700 font-medium">
                    {overallStats.blocked} task{overallStats.blocked > 1 ? 's' : ''} blocked
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {overdueItems.length > 0 ? (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-700">{overdueItems.length} Overdue</span>
                    <Badge className="bg-red-100 text-red-700 border-0">Critical</Badge>
                  </div>
                  <p className="text-xs text-red-600">Tasks past their due date</p>
                </div>
              ) : null}

              {dueSoonItems.length > 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-700">{dueSoonItems.length} Due Soon</span>
                    <Badge className="bg-amber-100 text-amber-700 border-0">Warning</Badge>
                  </div>
                  <p className="text-xs text-amber-600">Tasks due within 3 days</p>
                </div>
              ) : null}

              {overdueItems.length === 0 && dueSoonItems.length === 0 && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-emerald-700">All caught up!</p>
                  <p className="text-xs text-emerald-600">No urgent tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 h-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-white border-gray-200">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="overdue">Has Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-white border-gray-200">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">By Progress</SelectItem>
                <SelectItem value="tasks">By Task Count</SelectItem>
                <SelectItem value="overdue">By Overdue</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Board Progress Cards */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Board Progress ({filteredBoards.length})
          </h3>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-white border-0 shadow-sm animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-4" />
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(j => (
                        <div key={j} className="h-16 bg-gray-100 rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBoards.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">No boards found</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Create your first board to start tracking progress"
                  }
                </p>
                <Link to={createPageUrl("Boards")}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Boards
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredBoards.map((board, index) => (
                  <BoardProgressItem 
                    key={board.id} 
                    board={board} 
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    slate: "bg-slate-50 text-slate-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]} transition-all hover:scale-105`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function BoardProgressItem({ board, index }) {
  const boardColor = board.color || '#0073EA';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl(`Board?id=${board.id}`)}>
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: boardColor }} />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${boardColor}20` }}
                >
                  <Folder className="w-5 h-5" style={{ color: boardColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {board.title}
                  </h4>
                  <p className="text-xs text-gray-500">{board.stats.total} tasks</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800">{board.stats.completionRate}%</span>
                <p className="text-xs text-gray-500">complete</p>
              </div>
            </div>

            <ProgressBar 
              progress={board.stats.completionRate}
              status={board.stats.completionRate === 100 ? "done" : "in_progress"}
              size="md"
              showLabel={false}
              showPercentage={false}
              className="mb-4"
            />

            <div className="grid grid-cols-4 gap-2 text-center">
              <MiniStat label="To Do" value={board.stats.todo} color="slate" />
              <MiniStat label="In Progress" value={board.stats.inProgress} color="blue" />
              <MiniStat label="Blocked" value={board.stats.blocked} color="red" />
              <MiniStat label="Done" value={board.stats.done} color="emerald" />
            </div>

            {(board.stats.overdue > 0 || board.stats.dueSoon > 0) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                {board.stats.overdue > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    {board.stats.overdue} overdue
                  </Badge>
                )}
                {board.stats.dueSoon > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    {board.stats.dueSoon} due soon
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function MiniStat({ label, value, color }) {
  const colors = {
    slate: "text-slate-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600"
  };

  return (
    <div className="py-2">
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}