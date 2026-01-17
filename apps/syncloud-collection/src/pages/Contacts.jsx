import React, { useState, useEffect, useMemo } from "react";
import { Contact } from "@/entities/Contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Search,
  Mail,
  Phone,
  Building,
  Filter,
  MoreHorizontal,
  Tag,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Standard tag options
const STANDARD_TAGS = [
  'Customer', 'Prospect', 'Supplier', 'Partner', 'Colleague', 
  'Friend', 'Family', 'VIP', 'Cold Lead', 'Warm Lead', 
  'Hot Lead', 'Inactive', 'Follow Up', 'Priority'
];

const ContactTagManager = ({ contact, onTagsUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState(contact.tags || []);

  const availableStandardTags = STANDARD_TAGS.filter(tag => 
    !selectedTags.includes(tag)
  );

  const addTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onTagsUpdate(contact.id, updatedTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    onTagsUpdate(contact.id, updatedTags);
  };

  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="w-4 h-4 mr-1" />
          Tags ({selectedTags.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags - {contact.full_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Tags */}
          <div>
            <Label className="text-sm font-medium">Current Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 border rounded-md">
              {selectedTags.length === 0 ? (
                <span className="text-sm text-muted-foreground">No tags assigned</span>
              ) : (
                selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Add Custom Tag */}
          <div>
            <Label className="text-sm font-medium">Add Custom Tag</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter custom tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addCustomTag} disabled={!newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Standard Tags */}
          {availableStandardTags.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Quick Add Standard Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                {availableStandardTags.map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="text-xs"
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    tags: [],
    notes: ""
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await Contact.list("-created_date");
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      await Contact.create(newContact);
      setNewContact({
        full_name: "",
        email: "",
        phone: "",
        company: "",
        tags: [],
        notes: ""
      });
      setShowAddDialog(false);
      loadContacts();
      toast.success("Contact added successfully!");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleTagsUpdate = async (contactId, updatedTags) => {
    try {
      await Contact.update(contactId, { tags: updatedTags });
      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, tags: updatedTags }
          : contact
      ));
      toast.success("Tags updated successfully!");
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    }
  };

  const exportContacts = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Tags', 'Created'],
      ...contacts.map(contact => [
        contact.full_name,
        contact.email,
        contact.phone || '',
        contact.company || '',
        (contact.tags || []).join('; '),
        new Date(contact.created_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchTerm ||
        contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = !selectedTag || 
        (contact.tags && contact.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    });
  }, [contacts, searchTerm, selectedTag]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const companies = new Set(contacts.filter(c => c.company).map(c => c.company)).size;
    const thisMonth = contacts.filter(c => new Date(c.created_date).getMonth() === new Date().getMonth()).length;
    return { total, companies, thisMonth };
  }, [contacts]);

  // Get all unique tags from contacts
  const allTags = useMemo(() => {
    const tagSet = new Set();
    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Contact Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your business network and relationships
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={exportContacts} 
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Contact</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={newContact.full_name}
                    onChange={(e) => setNewContact({...newContact, full_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newContact.company}
                    onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    placeholder="Additional notes..."
                    className="h-20"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddContact}
                    disabled={!newContact.full_name || !newContact.email}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Add Contact
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">In your network</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm text-green-700 dark:text-green-300">Companies</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.companies}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Unique companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">This Month</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.thisMonth}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">New contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}
            
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              <span className="sm:hidden">Filter</span>
              <span className="hidden sm:inline">Advanced Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card className="w-full">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Contacts ({filteredContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {contacts.length === 0 ? "No contacts yet" : "No contacts match your search"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {contacts.length === 0 
                  ? "Start building your network by adding your first contact"
                  : "Try adjusting your search terms or filters"
                }
              </p>
              {contacts.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="flex flex-col gap-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm sm:text-base text-blue-600 font-medium">
                        {contact.full_name.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                        {contact.full_name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{contact.phone}</span>
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Building className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{contact.company}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="flex-shrink-0 w-8 h-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tags and Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ContactTagManager 
                        contact={contact} 
                        onTagsUpdate={handleTagsUpdate}
                      />
                      <Badge variant="outline" className="text-xs">
                        Added {new Date(contact.created_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}