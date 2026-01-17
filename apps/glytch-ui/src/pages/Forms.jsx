import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, FileText, Download, Upload, CheckCircle2, Clock, AlertCircle, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Forms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    form_type: '',
    form_title: '',
    client_name: '',
    client_email: '',
    case_reference: '',
    notes: '',
    status: 'draft'
  });

  const { data: forms, isLoading } = useQuery({
    queryKey: ['legal-forms'],
    queryFn: () => base44.entities.LegalForm.list('-created_date', 100),
    initialData: []
  });

  const createFormMutation = useMutation({
    mutationFn: (data) => base44.entities.LegalForm.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-forms'] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LegalForm.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-forms'] });
    }
  });

  const resetForm = () => {
    setFormData({
      form_type: '',
      form_title: '',
      client_name: '',
      client_email: '',
      case_reference: '',
      notes: '',
      status: 'draft'
    });
  };

  const handleFileUpload = async (e, formId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (formId) {
        await updateFormMutation.mutateAsync({
          id: formId,
          data: { file_url }
        });
      } else {
        setFormData(prev => ({ ...prev, file_url }));
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createFormMutation.mutate(formData);
  };

  const updateFormStatus = async (formId, newStatus) => {
    const updateData = { status: newStatus };
    if (newStatus === 'signed') {
      updateData.signed_date = new Date().toISOString();
    }
    await updateFormMutation.mutateAsync({ id: formId, data: updateData });
  };

  const downloadForm = (form) => {
    if (form.file_url) {
      window.open(form.file_url, '_blank');
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = 
      form.form_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.case_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || form.form_type === filterType;
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getFormTypeLabel = (type) => {
    const labels = {
      non_disclosure_agreement: 'Non-Disclosure Agreement',
      attorney_client_agreement: 'Service Agreement',
      consent_form: 'Consent Form',
      release_form: 'Release Form',
      retainer_agreement: 'Retainer Agreement',
      fee_agreement: 'Fee Agreement',
      authorization_form: 'Authorization Form',
      settlement_agreement: 'Settlement Agreement',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending_signature':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return 'bg-green-500';
      case 'pending_signature':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#E9C46A]/10 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent mb-2">
                Forms & Documents
              </h1>
              <p className="text-gray-600">Manage agreements and documents</p>
            </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#48CAE4]/50 text-[#030101] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0077B6]">Create New Form</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Form Type</Label>
                  <Select value={formData.form_type} onValueChange={(value) => setFormData({...formData, form_type: value})}>
                    <SelectTrigger className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]">
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#48CAE4]/50 text-[#030101]">
                      <SelectItem value="non_disclosure_agreement">Non-Disclosure Agreement</SelectItem>
                      <SelectItem value="attorney_client_agreement">Service Agreement</SelectItem>
                      <SelectItem value="consent_form">Consent Form</SelectItem>
                      <SelectItem value="release_form">Release Form</SelectItem>
                      <SelectItem value="retainer_agreement">Retainer Agreement</SelectItem>
                      <SelectItem value="fee_agreement">Fee Agreement</SelectItem>
                      <SelectItem value="authorization_form">Authorization Form</SelectItem>
                      <SelectItem value="settlement_agreement">Settlement Agreement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Form Title</Label>
                  <Input
                    placeholder="e.g., NDA - Project Consultation"
                    value={formData.form_title}
                    onChange={(e) => setFormData({...formData, form_title: e.target.value})}
                    className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User Name</Label>
                    <Input
                      placeholder="Full name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                      required
                    />
                  </div>
                  <div>
                    <Label>User Email</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={formData.client_email}
                      onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                      className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                    />
                  </div>
                </div>

                <div>
                  <Label>Project Reference (Optional)</Label>
                  <Input
                    placeholder="Project name or reference"
                    value={formData.case_reference}
                    onChange={(e) => setFormData({...formData, case_reference: e.target.value})}
                    className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                  />
                </div>

                <div>
                  <Label>Upload Form Document (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx"
                      className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                    />
                    {uploadingFile && <span className="text-[#48CAE4]">Uploading...</span>}
                  </div>
                  {formData.file_url && (
                    <p className="text-sm text-[#F4A261] mt-1">✓ File uploaded</p>
                  )}
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes or instructions"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] h-24 focus:border-[#48CAE4]"
                  />
                </div>

                {/* Policy Notice */}
                <div className="bg-[#48CAE4]/10 border border-[#48CAE4]/50 rounded-lg p-3">
                  <p className="text-[#48CAE4] text-xs font-semibold mb-1">📋 Form Policy</p>
                  <p className="text-[#48CAE4]/80 text-xs">
                    This form will be binding once signed. All parties must review carefully before signing.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white font-semibold">
                    Create Form
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
          
          {/* Info */}
          <div className="bg-gradient-to-r from-[#0077B6]/10 via-[#48CAE4]/10 to-[#F4A261]/10 border border-[#48CAE4]/50 rounded-lg p-4">
            <p className="text-[#48CAE4] text-sm font-semibold mb-2">📋 DOCUMENT NOTICE</p>
            <p className="text-[#48CAE4]/90 text-xs leading-relaxed">
              All documents and forms should be reviewed carefully before signing. 
              Electronic signatures have the same weight as handwritten signatures.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white backdrop-blur-sm border-2 border-[#48CAE4]/30 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]">
                <SelectValue placeholder="Form Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#48CAE4]/50 text-[#030101]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="non_disclosure_agreement">NDA</SelectItem>
                <SelectItem value="attorney_client_agreement">Service Agreement</SelectItem>
                <SelectItem value="consent_form">Consent</SelectItem>
                <SelectItem value="retainer_agreement">Retainer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-gray-50 border-[#48CAE4]/30 text-[#030101] focus:border-[#48CAE4]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#48CAE4]/50 text-[#030101]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_signature">Pending</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white backdrop-blur-sm border-2 border-[#0077B6]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0077B6]">{forms.length}</div>
              <div className="text-sm text-gray-600">Total Forms</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#48CAE4]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#48CAE4]">
                {forms.filter(f => f.status === 'pending_signature').length}
              </div>
              <div className="text-sm text-gray-600">Pending Signature</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#F4A261]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#F4A261]">
                {forms.filter(f => f.status === 'signed' || f.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-2 border-[#E9C46A]/30 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#E9C46A]">
                {forms.filter(f => f.form_type === 'non_disclosure_agreement').length}
              </div>
              <div className="text-sm text-gray-600">NDAs</div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading forms...</div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No forms found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredForms.map((form) => (
              <Card key={form.id} className="bg-white backdrop-blur-sm border-2 border-[#48CAE4]/30 hover:border-[#48CAE4] transition-all shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(form.status)}
                        <CardTitle className="text-[#030101] text-xl">{form.form_title}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-[#0077B6]/20 text-[#0077B6] border border-[#0077B6]/50">
                          {getFormTypeLabel(form.form_type)}
                        </Badge>
                        <Badge className={`${getStatusColor(form.status)}/20 border border-${getStatusColor(form.status)}`}>
                          {form.status.replace('_', ' ')}
                        </Badge>
                        {form.case_reference && (
                          <Badge variant="outline" className="border-gray-400 text-gray-600">
                            Ref: {form.case_reference}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>👤 {form.client_name}</p>
                        {form.client_email && <p>📧 {form.client_email}</p>}
                        <p>📅 Created: {new Date(form.created_date).toLocaleDateString()}</p>
                        {form.signed_date && (
                          <p className="text-[#F4A261]">✓ Signed: {new Date(form.signed_date).toLocaleDateString()}</p>
                        )}
                      </div>
                      {form.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">Note: {form.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {form.file_url && (
                        <Button
                          onClick={() => downloadForm(form)}
                          variant="outline"
                          size="sm"
                          className="border-[#48CAE4]/50 text-[#48CAE4] hover:bg-[#48CAE4]/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {form.status === 'draft' && (
                        <Button
                          onClick={() => updateFormStatus(form.id, 'pending_signature')}
                          size="sm"
                          className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white font-semibold"
                        >
                          Send for Signature
                        </Button>
                      )}
                      {form.status === 'pending_signature' && (
                        <Button
                          onClick={() => updateFormStatus(form.id, 'signed')}
                          size="sm"
                          className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white font-semibold"
                        >
                          Mark as Signed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}