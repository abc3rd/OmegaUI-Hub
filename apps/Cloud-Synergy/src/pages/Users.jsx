import React, { useState, useEffect } from "react";
import { User, SynergyScore } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Users as UsersIcon } from "lucide-react";
import { motion } from "framer-motion";

import UserProgressCard from "../components/dashboard/UserProgressCard";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, scoresData] = await Promise.all([
        User.list("-created_date"),
        SynergyScore.list("-overall_score")
      ]);
      setUsers(usersData);
      setScores(scoresData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getUsersWithScores = () => {
    return users.map(user => {
      const score = scores.find(s => s.user_id === user.id);
      return { user, score };
    });
  };

  const getFilteredAndSortedUsers = () => {
    let filteredUsers = getUsersWithScores();

    // Filter by search term
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(item =>
        item.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.organization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by user type
    if (filterType !== "all") {
      filteredUsers = filteredUsers.filter(item => item.user.user_type === filterType);
    }

    // Sort
    switch (sortBy) {
      case "name":
        filteredUsers.sort((a, b) => (a.user.full_name || "").localeCompare(b.user.full_name || ""));
        break;
      case "score":
        filteredUsers.sort((a, b) => (b.score?.overall_score || 0) - (a.score?.overall_score || 0));
        break;
      case "recent":
        filteredUsers.sort((a, b) => new Date(b.user.created_date) - new Date(a.user.created_date));
        break;
      default:
        break;
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  const getTypeStats = () => {
    const stats = { all: users.length };
    users.forEach(user => {
      stats[user.user_type] = (stats[user.user_type] || 0) + 1;
    });
    return stats;
  };

  const typeStats = getTypeStats();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-slate-600 mt-2">Monitor and manage user AI collaboration performance</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "All Users", value: typeStats.all, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Students", value: typeStats.student || 0, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Employees", value: typeStats.employee || 0, color: "bg-purple-50 text-purple-700 border-purple-200" },
            { label: "Individuals", value: typeStats.individual || 0, color: "bg-orange-50 text-orange-700 border-orange-200" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${stat.color}`}
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="individual">Individuals</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="score">Sort by Score</SelectItem>
                <SelectItem value="recent">Sort by Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-16 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="w-16 h-3 bg-slate-200 rounded" />
                    <div className="w-12 h-4 bg-slate-200 rounded" />
                  </div>
                  <div className="w-20 h-20 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((item, index) => (
              <UserProgressCard
                key={item.user.id}
                user={item.user}
                score={item.score}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Users Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "No users have been added to the system yet"}
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
              <Plus className="w-4 h-4" />
              Invite First User
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}