import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SpotForm({ onSubmit, onCancel, coordinates, categories }) {
    const [spot, setSpot] = useState({
        name: '',
        description: '',
        utility_type: '',
        operating_hours: '',
        latitude: coordinates?.lat || 0,
        longitude: coordinates?.lng || 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSpot(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (value) => {
        setSpot(prev => ({ ...prev, utility_type: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!spot.name || !spot.utility_type) {
            toast.error("Please fill in the spot name and resource type.");
            return;
        }
        if (!coordinates || !coordinates.lat || !coordinates.lng) {
            toast.error("Invalid location coordinates.");
            return;
        }
        onSubmit({
            ...spot,
            latitude: coordinates.lat,
            longitude: coordinates.lng
        });
    };

    if (!coordinates) {
        return <div className="p-4 text-center text-muted-foreground">Loading location...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Spot Name *</Label>
                <Input 
                    id="name" 
                    name="name" 
                    value={spot.name} 
                    onChange={handleChange} 
                    placeholder="e.g., Downtown Community Fridge" 
                    required 
                />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                    id="description" 
                    name="description" 
                    value={spot.description} 
                    onChange={handleChange} 
                    placeholder="Notes about the spot, access details, etc." 
                    rows={3}
                />
            </div>
            <div>
                <Label htmlFor="utility_type">Resource Type *</Label>
                <Select onValueChange={handleTypeChange} value={spot.utility_type} required>
                    <SelectTrigger id="utility_type">
                        <SelectValue placeholder="Select a resource type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="operating_hours">Operating Hours (optional)</Label>
                <Input 
                    id="operating_hours" 
                    name="operating_hours" 
                    value={spot.operating_hours} 
                    onChange={handleChange} 
                    placeholder="e.g., 24/7 or 9am - 5pm" 
                />
            </div>
            <div className="text-xs text-muted-foreground">
                Location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Resource</Button>
            </div>
        </form>
    );
}