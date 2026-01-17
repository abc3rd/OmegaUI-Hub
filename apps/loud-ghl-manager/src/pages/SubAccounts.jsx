import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Search, ExternalLink, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SubAccounts() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: subAccounts = [], isLoading, refetch } = useQuery({
    queryKey: ['subAccounts'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('ghlAPI', { action: 'listSubAccounts' });
      return data.success ? data.data : [];
    },
    initialData: [],
  });

  const filteredAccounts = subAccounts.filter(account =>
    account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#fce7fc]/20 to-[#ea00ea]/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GHL Sub-Accounts</h1>
            <p className="text-gray-600">
              View and manage all sub-accounts in your GHL agency
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by account name or ID..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-600">Loading sub-accounts...</p>
            </CardContent>
          </Card>
        ) : filteredAccounts.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No Matching Sub-Accounts' : 'No Sub-Accounts Found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No sub-accounts are currently available in your GHL agency'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <p className="text-gray-500 text-xs">Account ID</p>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {account.id}
                      </p>
                    </div>
                    {account.address && (
                      <div>
                        <p className="text-gray-500 text-xs">Address</p>
                        <p className="text-xs">{account.address}</p>
                        {account.city && account.state && (
                          <p className="text-xs text-gray-600">
                            {account.city}, {account.state} {account.postalCode}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {account.website && (
                    <a
                      href={account.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && subAccounts.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredAccounts.length} of {subAccounts.length} sub-accounts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}