import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, UserPlus, Phone, Mail } from 'lucide-react';

const mockLeads = [
  { id: 1, name: 'John Doe', company: 'Innovate Inc.', status: 'Contacted' },
  { id: 2, name: 'Jane Smith', company: 'Solutions Corp.', status: 'New' },
  { id: 3, name: 'Peter Jones', company: 'Future Systems', status: 'Closed' },
];

const statusColors = {
    'New': 'bg-blue-500',
    'Contacted': 'bg-yellow-500',
    'Closed': 'bg-green-500',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search leads..." 
            className="pl-10 bg-gray-800 border-gray-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {filteredLeads.map(lead => (
          <Card key={lead.id} className="bg-gray-800 border-gray-700 text-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${statusColors[lead.status]}`}></div>
                  <div>
                    <p className="font-bold">{lead.name}</p>
                    <p className="text-sm text-gray-400">{lead.company}</p>
                  </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}