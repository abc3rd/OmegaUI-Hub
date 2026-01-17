import React, { useState, useEffect } from 'react';
import { CodeSnippet } from '@/entities/CodeSnippet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Copy, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function SnippetForm({ snippet, onSave, onCancel }) {
    const [formData, setFormData] = useState(snippet || { title: '', language: 'javascript', code: '' });

    const handleSubmit = async () => {
        if (!formData.title || !formData.code) {
            toast.error("Title and code are required.");
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
                <Label htmlFor="language">Language</Label>
                <Input id="language" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} />
            </div>
            <div>
                <Label htmlFor="code">Code</Label>
                <Textarea id="code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="h-48 font-mono"/>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Snippet</Button>
            </DialogFooter>
        </div>
    );
}

export default function CodeSnippets() {
    const [snippets, setSnippets] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState(null);

    useEffect(() => { loadSnippets(); }, []);

    const loadSnippets = async () => {
        const snippetData = await CodeSnippet.list('-created_date');
        setSnippets(snippetData);
    };

    const handleSave = async (data) => {
        try {
            if (editingSnippet) {
                await CodeSnippet.update(editingSnippet.id, data);
                toast.success("Snippet updated!");
            } else {
                await CodeSnippet.create(data);
                toast.success("Snippet created!");
            }
            setIsDialogOpen(false);
            setEditingSnippet(null);
            loadSnippets();
        } catch (error) {
            toast.error("Could not save snippet.");
        }
    };
    
    const handleDelete = async (id) => {
        try {
            await CodeSnippet.delete(id);
            toast.success("Snippet deleted.");
            loadSnippets();
        } catch (error) {
            toast.error("Could not delete snippet.");
        }
    }

    const handleEdit = (snippet) => {
        setEditingSnippet(snippet);
        setIsDialogOpen(true);
    }
    
    const handleNew = () => {
        setEditingSnippet(null);
        setIsDialogOpen(true);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Code Snippet Library</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button onClick={handleNew}><Plus className="mr-2 h-4 w-4"/>Add Snippet</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>{editingSnippet ? 'Edit' : 'New'} Snippet</DialogTitle></DialogHeader><SnippetForm snippet={editingSnippet} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} /></DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {snippets.map(snippet => (
                    <Card key={snippet.id} className="bg-card">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-card-foreground">{snippet.title}</CardTitle>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(snippet)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(snippet.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(snippet.code); toast.success('Copied to clipboard!'); }}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <ReactMarkdown components={{
                                    pre: ({children}) => <pre className="font-mono text-muted-foreground">{children}</pre>,
                                    code: ({node, ...props}) => <code className={`language-${snippet.language}`} {...props} />
                                }}>
                                    {`\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}