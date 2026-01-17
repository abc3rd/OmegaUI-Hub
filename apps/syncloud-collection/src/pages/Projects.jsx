import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-neutral text-neutral-foreground' },
    active: { label: 'Active', color: 'bg-success text-success-foreground' },
    completed: { label: 'Completed', color: 'bg-primary text-primary-foreground' },
    archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};

function ProjectForm({ project, onSave, onCancel }) {
    const [formData, setFormData] = useState(project || { name: '', description: '', status: 'draft' });

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Project name is required.");
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={status => setFormData({ ...formData, status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Project</Button>
            </DialogFooter>
        </div>
    );
}

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    useEffect(() => { loadProjects(); }, []);

    const loadProjects = async () => {
        const projectData = await Project.list('-created_date');
        setProjects(projectData);
    };

    const handleSave = async (data) => {
        try {
            if (editingProject) {
                await Project.update(editingProject.id, data);
                toast.success("Project updated successfully!");
            } else {
                await Project.create(data);
                toast.success("Project created successfully!");
            }
            setIsDialogOpen(false);
            setEditingProject(null);
            loadProjects();
        } catch (error) {
            console.error("Failed to save project:", error);
            toast.error("Could not save the project.");
        }
    };
    
    const handleEdit = (project) => {
        setEditingProject(project);
        setIsDialogOpen(true);
    }
    
    const handleNew = () => {
        setEditingProject(null);
        setIsDialogOpen(true);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Project Manager</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4"/>New Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
                        </DialogHeader>
                        <ProjectForm 
                            project={editingProject} 
                            onSave={handleSave} 
                            onCancel={() => setIsDialogOpen(false)} 
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Card key={project.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{project.name}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription className="text-xs pt-1">
                                Created on {new Date(project.created_date).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{project.description || "No description available."}</p>
                        </CardContent>
                        <CardFooter>
                            <Badge className={`${statusConfig[project.status]?.color || 'bg-gray-400'}`}>
                                {statusConfig[project.status]?.label || 'Unknown'}
                            </Badge>
                        </CardFooter>
                    </Card>
                ))}
                {projects.length === 0 && (
                     <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>No projects yet.</p>
                        <p>Click "New Project" to get started!</p>
                     </div>
                )}
            </div>
        </div>
    );
}