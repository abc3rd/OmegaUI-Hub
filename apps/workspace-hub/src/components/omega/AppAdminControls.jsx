import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoreVertical, Edit, EyeOff, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AppAdminControls({ app, isHidden }) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(app.category);

  const handleToggleHidden = async () => {
    try {
      await base44.entities.apps.update(app.id, { hidden: !app.hidden });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['googleSheets'] });
      toast.success(app.hidden ? "App unhidden" : "App hidden");
    } catch (error) {
      toast.error("Failed to update app");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    
    try {
      await base44.entities.apps.delete(app.id);
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['googleSheets'] });
      toast.success("App deleted");
    } catch (error) {
      toast.error("Failed to delete app");
    }
  };

  const handleSaveCategory = async () => {
    try {
      await base44.entities.apps.update(app.id, { category: editedCategory });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['googleSheets'] });
      toast.success("Category updated");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            setEditDialogOpen(true);
          }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Category
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleToggleHidden();
          }}>
            {app.hidden ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Unhide App
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide App
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete App
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                placeholder="Enter category name"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}