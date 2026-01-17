import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Clock, Eye } from 'lucide-react';

const typeColors = {
  auto_accident: 'bg-pink-500',
  medical_malpractice: 'bg-blue-500',
  wrongful_death: 'bg-gray-800',
  slip_fall: 'bg-orange-500',
  product_liability: 'bg-purple-500',
  premises_liability: 'bg-teal-500',
  workers_comp: 'bg-yellow-600',
  other: 'bg-gray-500'
};

const statusColors = {
  new_intake: 'text-blue-600',
  pending_docs: 'text-orange-600',
  vetted: 'text-green-600',
  referred: 'text-purple-600',
  accepted: 'text-green-700',
  rejected: 'text-red-600',
  closed: 'text-gray-600'
};

export default function ReferralNetwork({ leads, attorneys }) {
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
  });

  const handleAccept = (lead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { status: 'accepted' }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            Referral Network Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            View incoming leads matched to practice areas.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50 text-left">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Value Est.</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No leads available. Create new leads to see them here.
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">
                        #{lead.lead_number || lead.id.slice(0, 8)}
                      </td>
                      <td className="p-4">
                        <Badge className={`${typeColors[lead.lead_type] || 'bg-gray-500'} text-white`}>
                          {lead.lead_type?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {lead.city || 'Unknown'}, {lead.state || 'FL'}
                      </td>
                      <td className="p-4 font-semibold">
                        {lead.estimated_value 
                          ? `$${lead.estimated_value.toLocaleString()}` 
                          : 'Undefined'
                        }
                      </td>
                      <td className={`p-4 font-bold ${statusColors[lead.status]}`}>
                        {lead.status === 'vetted' && <Check className="inline w-4 h-4 mr-1" />}
                        {lead.status === 'pending_docs' && <Clock className="inline w-4 h-4 mr-1" />}
                        {lead.status?.replace('_', ' ')}
                      </td>
                      <td className="p-4">
                        {lead.status === 'vetted' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(lead)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        )}
                        {lead.status === 'pending_docs' && (
                          <Button size="sm" variant="outline" disabled>
                            <Clock className="w-4 h-4 mr-1" />
                            Wait
                          </Button>
                        )}
                        {lead.status === 'new_intake' && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                        {['accepted', 'referred', 'closed'].includes(lead.status) && (
                          <Button size="sm" variant="ghost" disabled>
                            {lead.status}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Partner Attorneys */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Partner Attorneys</CardTitle>
        </CardHeader>
        <CardContent>
          {attorneys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No partner attorneys yet. Add attorneys to see them here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attorneys.filter(a => a.status === 'active').map(attorney => (
                <div key={attorney.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{attorney.name}</div>
                  <div className="text-sm text-gray-600">{attorney.firm_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {attorney.city}, {attorney.state}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attorney.practice_areas?.slice(0, 3).map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
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