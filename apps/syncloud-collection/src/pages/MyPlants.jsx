import React, { useState, useEffect } from 'react';
import { Plant } from '@/entities/Plant';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Droplets, Leaf } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function PlantForm({ plant, onSave, onCancel }) {
    const [formData, setFormData] = useState(plant || {
        name: '',
        species: '',
        category: 'Houseplant',
        location: '',
        watering_frequency: 7,
        fertilizing_frequency: 90,
        last_watered: new Date().toISOString(),
        last_fertilized: new Date().toISOString()
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.species) {
            toast.error("Plant name and species are required.");
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="space-y-4">
             <div><Label>Plant Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
             <div><Label>Species</Label><Input value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} /></div>
             <div><Label>Category</Label>
                <Select value={formData.category} onValueChange={category => setFormData({ ...formData, category })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {['Houseplant', 'Annual', 'Perennial', 'Shrub', 'Hedge', 'Tree', 'Vegetable'].map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
            <div><Label>Watering Frequency (days)</Label><Input type="number" value={formData.watering_frequency} onChange={e => setFormData({ ...formData, watering_frequency: parseInt(e.target.value) })} /></div>
            <div><Label>Fertilizing Frequency (days)</Label><Input type="number" value={formData.fertilizing_frequency} onChange={e => setFormData({ ...formData, fertilizing_frequency: parseInt(e.target.value) })} /></div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Plant</Button>
            </DialogFooter>
        </div>
    );
}

export default function MyPlants() {
    const [plants, setPlants] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState(null);

    useEffect(() => { loadPlants(); }, []);

    const loadPlants = async () => {
        const plantData = await Plant.list('-created_date');
        setPlants(plantData);
    };

    const handleSave = async (data) => {
        try {
            if (editingPlant) {
                await Plant.update(editingPlant.id, data);
                toast.success("Plant updated!");
            } else {
                await Plant.create(data);
                toast.success("Plant added!");
            }
            setIsDialogOpen(false);
            setEditingPlant(null);
            loadPlants();
        } catch (error) {
            toast.error("Could not save plant.");
        }
    };
    
    const handleDelete = async (id) => {
        try {
            await Plant.delete(id);
            toast.success("Plant removed.");
            loadPlants();
        } catch (error) {
            toast.error("Could not remove plant.");
        }
    };

    const handleWater = async (plant) => {
        await Plant.update(plant.id, { last_watered: new Date().toISOString() });
        toast.success(`${plant.name} watered!`);
        loadPlants();
    };

     const handleFertilize = async (plant) => {
        await Plant.update(plant.id, { last_fertilized: new Date().toISOString() });
        toast.success(`${plant.name} fertilized!`);
        loadPlants();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Plants</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingPlant(null); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4"/>Add Plant</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingPlant ? "Edit Plant" : "Add New Plant"}</DialogTitle></DialogHeader>
                        <PlantForm plant={editingPlant} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plants.map(plant => (
                    <Card key={plant.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {plant.name}
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPlant(plant); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(plant.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{plant.species} • {plant.location}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-sm">Water every {plant.watering_frequency} days.</p>
                             <p className="text-sm">Fertilize every {plant.fertilizing_frequency} days.</p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                             <Button size="sm" variant="outline" className="flex-1" onClick={() => handleWater(plant)}><Droplets className="mr-2 h-4 w-4" />Water</Button>
                             <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFertilize(plant)}><Leaf className="mr-2 h-4 w-4" />Fertilize</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}