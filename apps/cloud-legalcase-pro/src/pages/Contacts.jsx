import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Mail, Phone, MapPin, Star, Search, 
  Plus, ArrowLeft, Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeColors = {
  attorney: 'bg-purple-100 text-purple-800',
  client: 'bg-blue-100 text-blue-800',
  witness: 'bg-green-100 text-green-800',
  expert: 'bg-yellow-100 text-yellow-800',
  judge: 'bg-red-100 text-red-800',
  court_staff: 'bg-orange-100 text-orange-800',
  opposing_counsel: 'bg-pink-100 text-pink-800',
  paralegal: 'bg-indigo-100 text-indigo-800',
  investigator: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || contact.contact_type === selectedType;
    return matchesSearch && matchesType;
  });

  const contactTypes = ['all', ...new Set(contacts.map(c => c.contact_type))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Attorneys, experts, and key contacts</p>
          </div>
          
          <Link to={createPageUrl('NewContact')}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {contactTypes.map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    className={selectedType === type ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                    size="sm"
                  >
                    {type === 'all' ? 'All' : type.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Grid */}
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <Card key={contact.id} className="shadow-lg border-0 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={typeColors[contact.contact_type] || 'bg-gray-100'}>
                      {contact.contact_type?.replace('_', ' ')}
                    </Badge>
                    {contact.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{contact.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-1">{contact.name}</h3>
                  {contact.title && (
                    <p className="text-sm text-gray-600 mb-2">{contact.title}</p>
                  )}

                  {contact.organization && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building className="w-4 h-4" />
                      {contact.organization}
                    </div>
                  )}

                  <div className="space-y-2 pt-3 border-t">
                    {contact.email && (
                      <a 
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                      >
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a 
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    )}
                    {(contact.city || contact.state) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {[contact.city, contact.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Found</h3>
              <p className="text-gray-600 mb-6">
                {contacts.length === 0 
                  ? 'Start building your network by adding contacts'
                  : 'Try adjusting your search or filters'}
              </p>
              <Link to={createPageUrl('NewContact')}>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}