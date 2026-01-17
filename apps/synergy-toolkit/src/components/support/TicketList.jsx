import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function TicketList({ tickets, isLoading, onEdit, onStatusUpdate }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { bg: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
      in_progress: { bg: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
      resolved: { bg: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
      closed: { bg: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.bg} border text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return "text-red-400";
      case 'high': return "text-orange-400";
      case 'medium': return "text-yellow-400";
      default: return "text-blue-400";
    }
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Ticket</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Priority</TableHead>
              <TableHead className="text-gray-400">Created</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-gray-800">
                  <TableCell><Skeleton className="h-4 w-48 bg-gray-700" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-gray-700 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-gray-700" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 bg-gray-700 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : tickets.map(ticket => (
              <TableRow key={ticket.id} className="border-gray-800 hover:bg-gray-800/30">
                <TableCell>
                  <div>
                    <div className="font-medium text-white">{ticket.title}</div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">
                      {ticket.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell className="text-gray-400">
                  {format(new Date(ticket.created_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-700">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem onClick={() => onEdit(ticket)} className="hover:bg-gray-700">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {ticket.status === 'open' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(ticket.id, 'in_progress')} className="hover:bg-gray-700">
                          <Clock className="w-4 h-4 mr-2" /> Start Progress
                        </DropdownMenuItem>
                      )}
                      {ticket.status === 'in_progress' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(ticket.id, 'resolved')} className="hover:bg-gray-700">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                        </DropdownMenuItem>
                      )}
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