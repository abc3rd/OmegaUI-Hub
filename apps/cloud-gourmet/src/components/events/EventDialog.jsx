import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { format } from "date-fns";

export default function EventDialog({ open, onOpenChange, event, recipes, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    theme: "",
    date: "",
    location: "",
    guest_count: 0,
    menu: [],
    guests: [],
    notes: "",
    status: "planning"
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        theme: event.theme || "",
        date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : "",
        location: event.location || "",
        guest_count: event.guest_count || 0,
        menu: event.menu || [],
        guests: event.guests || [],
        notes: event.notes || "",
        status: event.status || "planning"
      });
    } else {
      setFormData({
        name: "",
        theme: "",
        date: "",
        location: "",
        guest_count: 0,
        menu: [],
        guests: [],
        notes: "",
        status: "planning"
      });
    }
  }, [event, open]);

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menu: [...prev.menu, { course: "appetizer", recipe_id: "", recipe_name: "" }]
    }));
  };

  const updateMenuItem = (index, field, value) => {
    const newMenu = [...formData.menu];
    if (field === 'recipe_id') {
      const recipe = recipes.find(r => r.id === value);
      newMenu[index] = { ...newMenu[index], recipe_id: value, recipe_name: recipe?.name || "" };
    } else {
      newMenu[index] = { ...newMenu[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, menu: newMenu }));
  };

  const removeMenuItem = (index) => {
    setFormData(prev => ({
      ...prev,
      menu: prev.menu.filter((_, i) => i !== index)
    }));
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { name: "", email: "", dietary_restrictions: "", rsvp_status: "pending" }]
    }));
  };

  const updateGuest = (index, field, value) => {
    const newGuests = [...formData.guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData(prev => ({ ...prev, guests: newGuests }));
  };

  const removeGuest = (index) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Input
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="e.g., Italian Night, Garden Party"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Venue or address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expected Guest Count</Label>
            <Input
              type="number"
              value={formData.guest_count}
              onChange={(e) => setFormData(prev => ({ ...prev, guest_count: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Menu</Label>
              <Button type="button" size="sm" onClick={addMenuItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Course
              </Button>
            </div>
            {formData.menu.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Select value={item.course} onValueChange={(value) => updateMenuItem(idx, 'course', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="soup">Soup</SelectItem>
                    <SelectItem value="salad">Salad</SelectItem>
                    <SelectItem value="main">Main</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={item.recipe_id} onValueChange={(value) => updateMenuItem(idx, 'recipe_id', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.filter(r => r.course_type === item.course).map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="ghost" onClick={() => removeMenuItem(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Guest List</Label>
              <Button type="button" size="sm" onClick={addGuest}>
                <Plus className="w-4 h-4 mr-1" /> Add Guest
              </Button>
            </div>
            {formData.guests.map((guest, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={guest.name}
                  onChange={(e) => updateGuest(idx, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={guest.email}
                  onChange={(e) => updateGuest(idx, 'email', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Dietary needs"
                  value={guest.dietary_restrictions}
                  onChange={(e) => updateGuest(idx, 'dietary_restrictions', e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => removeGuest(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}