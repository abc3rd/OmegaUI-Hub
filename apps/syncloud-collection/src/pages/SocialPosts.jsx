import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Twitter, Facebook, Linkedin, Instagram, Share2, Loader2 } from 'lucide-react';
import { InvokeLLM, GenerateImage } from '@/integrations/Core';
import { postToSocialMedia } from '@/functions/postToSocialMedia';
import { toast } from 'sonner';

const PinterestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M13.4 15.2c.7-1 .8-2.3.3-3.6.2-.7.1-1.5-.4-2-.5-.6-1.3-.8-2.1-.6-.9.2-1.5.8-1.7 1.7-.2.8.1 1.7.8 2.2.5.3 1.1.2 1.6-.2.1-.2.2-.4.1-.6-.2-.3-.5-.4-.8-.3-.3.1-.5.3-.4.6.1.5.5.8.9.9.5.1 1-.1 1.4-.6.2-.2.3-.5.2-.7-.2-.5-.6-.8-1.1-.9-.5-.1-1 .1-1.3.4-.1.1-.1.2 0 .3.1.1.2.1.3.1.4 0 .8-.3 1.1-.6.3-.3.4-.7.1-1-.1-.1-.3-.2-.4-.2s-.3.1-.4.2c-.3.4-.2.9.1 1.3.3.4.8.6 1.3.5.5-.1.9-.4 1.2-.8.3-.4.3-.9.1-1.3-.3-.6-.9-1-1.6-1s-1.3.4-1.6 1c-.3.6-.3 1.3 0 1.9.1.2.3.3.5.4.3.1.6 0 .8-.2.2-.2.3-.4.2-.6-.2-.3-.5-.4-.8-.3-.3.1-.5.3-.4.6.1.5.5.8.9.9.5.1 1-.1 1.4-.6.2-.2.3-.5.2-.7-.2-.5-.6-.8-1.1-.9-.5-.1-1 .1-1.3.4-.1.1-.1.2 0 .3s.2.1.3.1c.4 0 .8-.3 1.1-.6.3-.3.4-.7.1-1-.5-.9-1.6-1.2-2.6-1-1 .2-1.8 1-2 2-.2 1.1.2 2.3 1 3.1.8.8 2 1.2 3.1 1.1.8-.1 1.6-.5 2.1-1.2.5-.7.7-1.6.5-2.5-.2-.9-.8-1.6-1.5-2.1"/></svg>;
const RedditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M16.16 13.71A4.5 4.5 0 0 0 12 12.5a4.5 4.5 0 0 0-4.16 1.21M10 10.5h.01M14 10.5h.01M7.5 16.5c.33.67 1.2 1.5 4.5 1.5s4.17-.83 4.5-1.5"/></svg>;

export default function SocialPosts() {
    const [platforms, setPlatforms] = useState(['twitter']);
    const [topic, setTopic] = useState('');
    const [post, setPost] = useState({ content: '', image_url: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const platformConfig = {
      twitter: { icon: <Twitter className="h-5 w-5" />, name: 'Twitter' },
      facebook: { icon: <Facebook className="h-5 w-5" />, name: 'Facebook' },
      linkedin: { icon: <Linkedin className="h-5 w-5" />, name: 'LinkedIn' },
      instagram: { icon: <Instagram className="h-5 w-5" />, name: 'Instagram' },
      pinterest: { icon: <PinterestIcon />, name: 'Pinterest' },
      reddit: { icon: <RedditIcon />, name: 'Reddit' }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Please enter a topic for your post.");
            return;
        }
        setIsGenerating(true);
        setPost({ content: '', image_url: '' });
        toast.info("Generating content and image...", { duration: 5000 });
        
        try {
            const contentPromise = InvokeLLM({
                prompt: `Generate a short, engaging social media post about "${topic}". The post should be suitable for platforms like Twitter, Facebook, and LinkedIn. Include relevant hashtags.`,
                add_context_from_internet: true,
            });

            const imagePromise = GenerateImage({
                prompt: `High-quality, professional photograph for a social media post about "${topic}", eye-catching, vibrant colors, minimalist.`
            });

            const [contentResult, imageResult] = await Promise.all([contentPromise, imagePromise]);
            
            setPost({
                content: contentResult,
                image_url: imageResult.url
            });
            toast.success("Content and image generated!");

        } catch (error) {
            console.error("Generation failed:", error);
            toast.error("Failed to generate content or image.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handlePublish = async () => {
        if (!post.content) {
            toast.error("Please generate content before publishing.");
            return;
        }
        if (platforms.length === 0) {
            toast.error("Please select at least one platform to post to.");
            return;
        }

        setIsPublishing(true);
        toast.info(`Publishing to ${platforms.length} platform(s)...`);

        try {
            const { success, results } = await postToSocialMedia({
                platforms: platforms,
                content: post.content,
                imageUrl: post.image_url
            });

            if (success) {
                let successCount = 0;
                results.forEach(res => {
                    if (res.success) {
                        toast.success(`Successfully posted to ${res.platform}.`);
                        successCount++;
                    } else {
                        toast.error(`Failed to post to ${res.platform}: ${res.message}`);
                    }
                });
                if (successCount === platforms.length) {
                    toast.success("All posts published successfully!");
                } else {
                    toast.warning("Some posts could not be published.");
                }
            } else {
                toast.error("An error occurred during publishing.");
            }
        } catch (error) {
            console.error("Publishing error:", error);
            toast.error("A critical error occurred while trying to publish.");
        } finally {
            setIsPublishing(false);
        }
    };

    const togglePlatform = (platformKey) => {
        setPlatforms(prev => 
            prev.includes(platformKey)
                ? prev.filter(p => p !== platformKey)
                : [...prev, platformKey]
        );
    };

    return (
        <div className="p-6 grid lg:grid-cols-3 gap-8 w-full">
            {/* Left: Settings & Generation */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5" />
                            Create Social Post
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="platforms">1. Select Platforms</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {Object.entries(platformConfig).map(([key, { icon, name }]) => (
                                    <Button
                                        key={key}
                                        variant={platforms.includes(key) ? "secondary" : "outline"}
                                        onClick={() => togglePlatform(key)}
                                        className="flex flex-col h-16 gap-1"
                                        title={name}
                                    >
                                        {icon}
                                        <span className="text-xs">{name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="topic">2. Enter Topic</Label>
                            <Textarea
                                id="topic"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g., 'The future of AI in marketing'"
                                className="h-24"
                                disabled={isGenerating}
                            />
                        </div>
                        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                "Generate Content & Image"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Preview & Publish */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Preview & Publish
                            </div>
                            <Button 
                                onClick={handlePublish} 
                                disabled={isPublishing || isGenerating || !post.content}
                            >
                                {isPublishing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                                ) : (
                                    "Publish Now"
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4 space-y-4 min-h-[300px]">
                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <p>Generating your post...</p>
                                </div>
                            )}
                            {!isGenerating && !post.content && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                                    <p className="mb-4">Your generated post will appear here.</p>
                                    <p className="text-sm">Start by selecting platforms and entering a topic.</p>
                                </div>
                            )}
                            {post.content && (
                                <>
                                    <Textarea
                                        value={post.content}
                                        onChange={(e) => setPost(p => ({...p, content: e.target.value}))}
                                        className="h-32 text-base"
                                    />
                                    {post.image_url && (
                                        <div className="mt-4">
                                            <Label>Generated Image</Label>
                                            <img 
                                                src={post.image_url} 
                                                alt="Generated for social post" 
                                                className="mt-2 rounded-lg border aspect-video object-cover w-full"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}