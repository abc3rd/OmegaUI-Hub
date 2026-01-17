import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Document } from '@/entities/Document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Plus, Save, Trash2, Download, List } from 'lucide-react';

export default function DocEditor() {
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await Document.list('-updated_date');
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoc = (doc) => {
    setActiveDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
  };

  const handleNewDoc = () => {
    setActiveDoc(null);
    setTitle('Untitled Document');
    setContent('');
  };

  const handleSaveDoc = async () => {
    if (!title.trim()) {
      toast.error('Document title is required.');
      return;
    }

    try {
      if (activeDoc) {
        await Document.update(activeDoc.id, { title, content });
        toast.success('Document updated successfully!');
      } else {
        const newDoc = await Document.create({ title, content });
        setActiveDoc(newDoc);
        toast.success('Document saved successfully!');
      }
      loadDocuments();
    } catch (error) {
      toast.error('Failed to save document.');
    }
  };
  
  const handleDeleteDoc = async (docId) => {
    try {
      await Document.delete(docId);
      toast.success('Document deleted.');
      if (activeDoc && activeDoc.id === docId) {
        handleNewDoc();
      }
      loadDocuments();
    } catch (error) {
      toast.error('Failed to delete document.');
    }
  };

  const downloadDoc = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-r bg-card flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List /> My Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Button onClick={handleNewDoc} className="w-full mb-4"><Plus className="w-4 h-4 mr-2" /> New Document</Button>
          <div className="space-y-2">
            {documents.map(doc => (
              <div 
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${activeDoc?.id === doc.id ? 'bg-primary/20' : 'hover:bg-accent'}`}
              >
                <span className="truncate flex-1">{doc.title}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteDoc(doc.id)}}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0"
          />
          <Button onClick={handleSaveDoc}><Save className="w-4 h-4 mr-2" /> Save</Button>
          <Button variant="outline" onClick={downloadDoc}><Download className="w-4 h-4 mr-2" /> Download</Button>
        </div>
        <div className="flex-1 bg-white rounded-lg overflow-hidden">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            className="h-full"
            modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline','strike', 'blockquote'],
                  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
          />
        </div>
      </div>
    </div>
  );
}