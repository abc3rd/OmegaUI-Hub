import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Download, MessageSquare, Calendar, FileText, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100),
    initialData: []
  });

  const { data: forms } = useQuery({
    queryKey: ['legal-forms'],
    queryFn: () => base44.entities.LegalForm.list('-created_date', 100),
    initialData: []
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.case_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || conv.client_type === filterType;
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getRelatedForms = (conversationId, caseRef, clientEmail) => {
    return forms.filter(form => 
      form.conversation_id === conversationId ||
      (caseRef && form.case_reference === caseRef) ||
      (clientEmail && form.client_email === clientEmail)
    );
  };

  const downloadConversation = (conv) => {
    const relatedForms = getRelatedForms(conv.id, conv.case_reference, conv.client_email);
    
    const conversationText = conv.messages?.map(msg => {
      const date = new Date(msg.timestamp).toLocaleString();
      return `[${date}] ${msg.role.toUpperCase()}: ${msg.content}`;
    }).join('\n\n') || 'No messages';

    const formsSection = relatedForms.length > 0 
      ? `\n\n${'='.repeat(50)}\nASSOCIATED FORMS\n${'='.repeat(50)}\n\n${relatedForms.map(f => 
          `Form: ${f.form_title}\nType: ${f.form_type}\nStatus: ${f.status}\nCreated: ${new Date(f.created_date).toLocaleString()}\n${f.file_url ? `Document: ${f.file_url}\n` : ''}`
        ).join('\n\n')}`
      : '';

    const blob = new Blob([
      `UCRASH - Murphy's Law Conversation Record\n`,
      `AI Legal Aid Volunteer - NOT Legal Advice\n`,
      `Always Consult with a Licensed Attorney\n`,
      `\n`,
      `\nClient: ${conv.client_name}\n`,
      `Email: ${conv.client_email}\n`,
      `Type: ${conv.client_type}\n`,
      `Case Reference: ${conv.case_reference || 'N/A'}\n`,
      `Status: ${conv.status}\n`,
      `Created: ${new Date(conv.created_date).toLocaleString()}\n`,
      `\n${'='.repeat(50)}\nCONVERSATION HISTORY\n${'='.repeat(50)}\n\n`,
      conversationText,
      formsSection
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Murphy_${conv.client_name}_${new Date(conv.created_date).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#71D6B5]/10 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#c61c39] mb-2">
            Murphy's Law - Conversation Records
          </h1>
          <p className="text-gray-600">All documented conversations with Murphy AI Legal Aid Volunteer</p>
          <div className="bg-[#c61c39]/10 border border-[#c61c39]/50 rounded-lg p-3 mt-4">
            <p className="text-[#c61c39] text-xs font-semibold mb-1">⚖️ LEGAL DISCLAIMER</p>
            <p className="text-[#c61c39]/90 text-xs">
              Murphy is an AI legal aid volunteer, NOT a licensed attorney. Information is educational only. Always consult with a qualified attorney.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white backdrop-blur-sm border-2 border-[#155EEF]/30 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or case reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-[#155EEF]/30 text-[#030101]"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-gray-50 border-[#155EEF]/30 text-[#030101]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="attorney">Attorneys</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-gray-50 border-[#155EEF]/30 text-[#030101]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white backdrop-blur-sm border-2 border-[#c61c39]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#c61c39]">{conversations.length}</div>
              <div className="text-sm text-gray-600">Total Conversations</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#155EEF]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#155EEF]">
                {conversations.filter(c => c.client_type === 'client').length}
              </div>
              <div className="text-sm text-gray-600">Client Conversations</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#71D6B5]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#71D6B5]">
                {conversations.filter(c => c.client_type === 'attorney').length}
              </div>
              <div className="text-sm text-gray-600">Attorney Conversations</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#030101]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#030101]">{forms.length}</div>
              <div className="text-sm text-gray-600">Associated Forms</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="text-center text-gray-600 py-12">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conv) => {
              const relatedForms = getRelatedForms(conv.id, conv.case_reference, conv.client_email);

              return (
                <Card key={conv.id} className="bg-white backdrop-blur-sm border-2 border-[#155EEF]/30 hover:border-[#155EEF] transition-all shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#030101] text-xl mb-2">{conv.client_name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={conv.client_type === 'attorney' ? 'bg-[#155EEF]' : 'bg-[#c61c39]'}>
                            {conv.client_type}
                          </Badge>
                          <Badge variant="outline" className="border-[#71D6B5]/50 text-[#71D6B5]">
                            {conv.status}
                          </Badge>
                          {conv.case_reference && (
                            <Badge variant="outline" className="border-gray-400 text-gray-600">
                              Case: {conv.case_reference}
                            </Badge>
                          )}
                          {relatedForms.length > 0 && (
                            <Badge className="bg-[#71D6B5]/20 border border-[#71D6B5]/50 text-[#71D6B5]">
                              {relatedForms.length} Form{relatedForms.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📧 {conv.client_email}</p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(conv.created_date).toLocaleString()}
                          </p>
                          <p className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {conv.messages?.length || 0} messages
                          </p>
                        </div>

                        {/* Related Forms */}
                        {relatedForms.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#155EEF]/20">
                            <p className="text-sm text-[#155EEF] mb-2 font-semibold">📋 Associated Forms:</p>
                            <div className="space-y-1">
                              {relatedForms.map(form => (
                                <div key={form.id} className="flex items-center gap-2 text-xs text-gray-600">
                                  <FileText className="w-3 h-3" />
                                  <span>{form.form_title}</span>
                                  <Badge className="text-xs px-1 py-0">{form.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => downloadConversation(conv)}
                          variant="outline"
                          size="sm"
                          className="border-[#155EEF]/50 text-[#155EEF] hover:bg-[#155EEF]/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export All
                        </Button>
                        {relatedForms.length > 0 && (
                          <Link to={createPageUrl('Forms')}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#71D6B5]/50 text-[#71D6B5] hover:bg-[#71D6B5]/10 w-full"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Forms
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {conv.summary && (
                    <CardContent>
                      <p className="text-gray-600 text-sm italic">{conv.summary}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}