import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import SocialCard from "../components/social/SocialCard";
import AddSocialModal from "../components/social/AddSocialModal";
import ShareModal from "../components/social/ShareModal";

export default function SocialHub() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => base44.entities.SocialAccount.filter({ is_active: true }, 'grid_position'),
    initialData: [],
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, position }) => 
      base44.entities.SocialAccount.update(id, { grid_position: position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(accounts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      if (item.grid_position !== index) {
        updatePositionMutation.mutate({ id: item.id, position: index });
      }
    });
  };

  const getCardSpan = (size) => {
    switch (size) {
      case 'large': return 'md:col-span-2 md:row-span-2';
      case 'medium': return 'md:col-span-2';
      case 'small': return 'md:col-span-1';
      default: return 'md:col-span-2';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#ea00ea]/5 to-[#8b00ff]/5">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-[#ea00ea]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6910a1e91ad27e19c0414d24/3be63d96d_ChatGPTImageJan1202601_38_18AM.png"
                alt="OmegaUI"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] bg-clip-text text-transparent">Social Hub</h1>
                <p className="text-sm text-[#c3c3c3]">Connect with us everywhere</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowShareModal(true)}
                className="border-[#ea00ea] text-[#ea00ea] hover:bg-[#ea00ea]/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] hover:from-[#d000d0] hover:to-[#7a00e6] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ea00ea]/20 to-[#8b00ff]/20 flex items-center justify-center">
              <Share2 className="w-10 h-10 text-[#ea00ea]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No social accounts yet</h2>
            <p className="text-[#c3c3c3] mb-6">Add your first social media account to get started</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] hover:from-[#d000d0] hover:to-[#7a00e6] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="social-grid" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]"
                >
                  {accounts.map((account, index) => (
                    <Draggable
                      key={account.id}
                      draggableId={account.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${getCardSpan(account.card_size)} ${
                            snapshot.isDragging ? 'z-50' : ''
                          }`}
                        >
                          <SocialCard account={account} isDragging={snapshot.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      {showAddModal && <AddSocialModal onClose={() => setShowAddModal(false)} />}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} accounts={accounts} />}
    </div>
  );
}