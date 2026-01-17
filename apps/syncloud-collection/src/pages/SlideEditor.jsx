import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Presentation as PresentationEntity } from '@/entities/Presentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Presentation, Plus, Save, Trash2, List, Play } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SlideEditor() {
  const [presentations, setPresentations] = useState([]);
  const [activePres, setActivePres] = useState(null);
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    try {
      const pres = await PresentationEntity.list('-updated_date');
      setPresentations(pres);
    } catch (error) {
      toast.error('Failed to load presentations.');
    }
  };

  const handleSelectPres = (pres) => {
    setActivePres(pres);
    setTitle(pres.title);
    setSlides(pres.slides || []);
    setActiveSlideIndex(0);
  };

  const handleNewPres = () => {
    setActivePres(null);
    setTitle('Untitled Presentation');
    setSlides([{ id: 'slide1', title: 'Slide Title', content: '<p>Slide Content</p>' }]);
    setActiveSlideIndex(0);
  };

  const handleSavePres = async () => {
    if (!title.trim()) {
      toast.error('Presentation title is required.');
      return;
    }
    const data = { title, slides };
    try {
      if (activePres) {
        await PresentationEntity.update(activePres.id, data);
        toast.success('Presentation updated!');
      } else {
        const newPres = await PresentationEntity.create(data);
        setActivePres(newPres);
        toast.success('Presentation saved!');
      }
      loadPresentations();
    } catch (error) {
      toast.error('Failed to save presentation.');
    }
  };

  const handleDeletePres = async (presId) => {
    try {
      await PresentationEntity.delete(presId);
      toast.success('Presentation deleted.');
      if (activePres?.id === presId) {
        handleNewPres();
      }
      loadPresentations();
    } catch (error) {
      toast.error('Failed to delete presentation.');
    }
  };

  const addSlide = () => {
    const newSlide = { id: `slide${slides.length + 1}`, title: 'New Slide', content: '' };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const updateActiveSlide = (key, value) => {
    const newSlides = [...slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], [key]: value };
    setSlides(newSlides);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSlides(items);
  };
  
  if (isPresenting) {
    const currentSlide = slides[activeSlideIndex];
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex flex-col justify-center items-center z-50 p-8">
        <div className="w-full h-full border-4 border-gray-700 rounded-lg p-16 flex flex-col">
           <h1 className="text-5xl font-bold mb-8 text-center">{currentSlide.title}</h1>
           <div className="text-2xl flex-1 overflow-y-auto" dangerouslySetInnerHTML={{ __html: currentSlide.content }} />
        </div>
        <div className="absolute bottom-4 flex gap-4">
          <Button onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}>Prev</Button>
          <span>{activeSlideIndex + 1} / {slides.length}</span>
          <Button onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}>Next</Button>
          <Button variant="destructive" onClick={() => setIsPresenting(false)}>Exit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-r bg-card flex flex-col">
        <CardHeader><CardTitle className="flex items-center gap-2"><List /> My Presentations</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Button onClick={handleNewPres} className="w-full mb-4"><Plus className="w-4 h-4 mr-2" /> New Presentation</Button>
          {presentations.map(p => (
            <div key={p.id} onClick={() => handleSelectPres(p)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${activePres?.id === p.id ? 'bg-primary/20' : 'hover:bg-accent'}`}>
              <span className="truncate flex-1">{p.title}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeletePres(p.id) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
          <h3 className="font-semibold mt-6 mb-2">Slides</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setActiveSlideIndex(index)} className={`p-2 rounded-md border flex items-center gap-2 cursor-pointer ${activeSlideIndex === index ? 'border-primary' : ''}`}>
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <span className="text-sm truncate">{slide.title}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button onClick={addSlide} variant="outline" className="w-full mt-4"><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
        </CardContent>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Presentation className="w-6 h-6 text-primary" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Presentation Title" className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0" />
          <Button onClick={() => setIsPresenting(true)} variant="secondary" disabled={!slides.length}><Play className="w-4 h-4 mr-2" /> Present</Button>
          <Button onClick={handleSavePres}><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
        {slides.length > 0 && activeSlideIndex < slides.length && (
          <div className="flex-1 flex flex-col gap-4">
             <Input 
                value={slides[activeSlideIndex].title}
                onChange={(e) => updateActiveSlide('title', e.target.value)}
                placeholder="Slide Title"
                className="text-xl font-bold"
              />
            <div className="flex-1 bg-white rounded-lg overflow-hidden border">
              <ReactQuill theme="snow" value={slides[activeSlideIndex].content} onChange={(val) => updateActiveSlide('content', val)} className="h-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}