import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TimelineClip from './TimelineClip';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Timeline({ 
  clips = [], 
  onClipsReorder, 
  onClipSelect,
  onClipRemove,
  selectedClipId,
  currentTime = 0,
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(clips);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onClipsReorder(items);
  };

  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);

  // Calculate accumulated time for each clip
  const getClipStartTime = (index) => {
    return clips.slice(0, index).reduce((sum, clip) => sum + (clip.duration || 0), 0);
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">Timeline</h3>
        <div className="text-xs text-gray-500">
          Total: {totalDuration.toFixed(1)}s
        </div>
      </div>

      {clips.length === 0 ? (
        <div className="h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
          <Plus className="w-6 h-6 mb-1" />
          <p className="text-xs">Drag media here to start</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-2 p-2 rounded-lg min-h-[100px] ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
                } border-2 border-gray-200 overflow-x-auto`}
              >
                {clips.map((clip, index) => {
                  const startTime = getClipStartTime(index);
                  const isCurrentClip = currentTime >= startTime && currentTime < startTime + clip.duration;

                  return (
                    <Draggable key={clip.id} draggableId={clip.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TimelineClip
                            clip={clip}
                            isSelected={selectedClipId === clip.id}
                            isCurrent={isCurrentClip}
                            onClick={() => onClipSelect(clip)}
                            onRemove={() => onClipRemove(clip.id)}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}