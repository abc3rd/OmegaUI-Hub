import React, { useState, useEffect } from "react";
import { SupportTicket } from "@/entities/SupportTicket";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Headphones } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

import AIChat from "../components/support/AIChat";
import TicketList from "../components/support/TicketList";
import TicketForm from "../components/support/TicketForm";
import SupportStats from "../components/support/SupportStats";
import RemoteAssistance from "../components/support/RemoteAssistance";

export default function AISupport() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await SupportTicket.list("-created_date");
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast.error("Failed to load support tickets.");
    }
    setIsLoading(false);
  };

  const handleTicketSubmit = async (ticketData) => {
    try {
      if (selectedTicket) {
        await SupportTicket.update(selectedTicket.id, ticketData);
        toast.success("Ticket updated successfully.");
      } else {
        await SupportTicket.create(ticketData);
        toast.success("Support ticket created successfully.");
      }
      setIsTicketFormOpen(false);
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      toast.error(`Failed to ${selectedTicket ? 'update' : 'create'} ticket.`);
    }
  };

  const handleTicketEdit = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketFormOpen(true);
  };

  const handleTicketStatusUpdate = async (ticketId, newStatus) => {
    try {
      await SupportTicket.update(ticketId, { status: newStatus });
      toast.success("Ticket status updated.");
      loadTickets();
    } catch (error) {
      toast.error("Failed to update ticket status.");
    }
  };

  const tabs = [
    { id: "chat", label: "AI Chat", icon: MessageCircle },
    { id: "tickets", label: "Support Tickets", icon: Plus },
    { id: "remote", label: "Remote Assistance", icon: Headphones }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">AI Support Hub</h1>
          <Dialog open={isTicketFormOpen} onOpenChange={(isOpen) => {
            setIsTicketFormOpen(isOpen);
            if (!isOpen) setSelectedTicket(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>{selectedTicket ? "Edit" : "Create"} Support Ticket</DialogTitle>
              </DialogHeader>
              <TicketForm
                ticket={selectedTicket}
                onSubmit={handleTicketSubmit}
                onCancel={() => setIsTicketFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <SupportStats tickets={tickets} isLoading={isLoading} />

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {activeTab === "chat" && (
            <div className="p-6">
              <AIChat />
            </div>
          )}
          
          {activeTab === "tickets" && (
            <div className="p-6">
              <TicketList 
                tickets={tickets}
                isLoading={isLoading}
                onEdit={handleTicketEdit}
                onStatusUpdate={handleTicketStatusUpdate}
              />
            </div>
          )}
          
          {activeTab === "remote" && (
            <div className="p-6">
              <RemoteAssistance />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}