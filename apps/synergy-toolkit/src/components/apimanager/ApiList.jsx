import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plug2, Edit, Trash2, Zap, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ApiList({ integrations, isLoading, onEdit, onDelete, onTest }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'inactive':
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case 'error':
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case 'testing':
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug2 className="w-5 h-5 text-purple-400" />
          Configured Integrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Last Tested</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-gray-800">
                  <TableCell><Skeleton className="h-6 w-20 bg-gray-700 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-gray-700" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-gray-700" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 bg-gray-700 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : integrations.map(api => (
              <TableRow key={api.id} className="border-gray-800 hover:bg-gray-800/50">
                <TableCell><Badge className={getStatusBadge(api.status)}>{api.status}</Badge></TableCell>
                <TableCell>
                  <div className="font-medium">{api.name}</div>
                  <div className="text-sm text-gray-400">{api.service_provider}</div>
                </TableCell>
                <TableCell className="text-gray-400">
                  {api.last_tested ? format(new Date(api.last_tested), "MMM d, yyyy") : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-700">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem onClick={() => onTest(api)} className="hover:bg-gray-700">
                        <Zap className="w-4 h-4 mr-2" /> Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(api)} className="hover:bg-gray-700">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(api.id)} className="text-red-400 hover:!text-red-400 hover:!bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}