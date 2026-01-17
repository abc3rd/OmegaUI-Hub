import React, { useState } from 'react';
import { EmailCampaign } from '@/entities/EmailCampaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Wand2, Send, Save } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

export default function EmailCampaigns() {
    const [campaign, setCampaign] = useState({ name: '', subject: '', body: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateBody = async () => {
        if (!campaign.subject) return;
        setIsGenerating(true);
        const prompt = `Write a marketing email body for a campaign named "${campaign.name}" with the subject line: "${campaign.subject}". The tone should be professional and persuasive.`;
        const bodyContent = await InvokeLLM({ prompt });
        setCampaign({ ...campaign, body: bodyContent });
        setIsGenerating(false);
    };

    const handleSave = async () => {
        await EmailCampaign.create(campaign);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Email Campaign Builder</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="campaignName">Campaign Name</Label>
                        <Input id="campaignName" placeholder="Q1 Newsletter" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
                    </div>
                    <div>
                        <Label htmlFor="subject">Subject Line</Label>
                        <div className="flex gap-2">
                            <Input id="subject" placeholder="What's New at Cloud Connect" value={campaign.subject} onChange={e => setCampaign({...campaign, subject: e.target.value})} />
                            <Button variant="outline" onClick={handleGenerateBody} disabled={isGenerating}>
                                <Wand2 className="mr-2 h-4 w-4" /> {isGenerating ? 'Generating...' : 'AI Generate Body'}
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label>Email Body</Label>
                        <ReactQuill theme="snow" value={campaign.body} onChange={value => setCampaign({...campaign, body: value})} className="bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                        <Button><Send className="mr-2 h-4 w-4" /> Send Campaign</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}