import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, CheckCircle2, Calculator, Calendar, Users, 
  Search, BookOpen, ArrowLeft, TrendingUp, DollarSign,
  Clock, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PatentToolkit() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Claims in Patent', value: '30', icon: FileText, color: 'text-purple-600' },
    { label: 'Protection Strength', value: '7.5/10', icon: Target, color: 'text-blue-600' },
    { label: 'Est. Patent Value', value: '$20M+', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Months to File', value: '12', icon: Clock, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
            Patent Filing Toolkit
          </h1>
          <p className="text-lg text-purple-100">
            Complete resource for patent search, filing, cost estimation & attorney preparation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="border-0 shadow-lg sticky top-32 z-10 bg-white">
            <CardContent className="p-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 bg-transparent h-auto">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="checklist" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Checklist
                </TabsTrigger>
                <TabsTrigger value="search" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Prior Art
                </TabsTrigger>
                <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="attorney" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Attorney
                </TabsTrigger>
                <TabsTrigger value="claims" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Claims
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Patent Filing Journey Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-700">
                  Welcome to your comprehensive patent filing assistant. This toolkit will guide you through every step of the patent process for your Universal Command Protocol (UCP) / Abstract Binary Command Protocol (ABCP) invention.
                </p>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Your Patent Status
                  </h3>
                  <p className="text-green-800">
                    You have a comprehensive, well-structured patent application ready for filing. The ABCP/UCP invention has strong commercial potential with estimated 90-99% energy savings and multiple licensing opportunities.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
                  <p className="text-blue-800">
                    Use the navigation tabs above to access different tools. Start with the "Checklist" to ensure you have everything needed, then use the "Calculator" to budget appropriately.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">🚀 Quick Start Guide</h3>
                  
                  <div className="space-y-4">
                    {[
                      { week: 'Week 1', title: 'Preparation', desc: 'Review patent application, conduct basic prior art search, find patent attorney' },
                      { week: 'Week 2-4', title: 'Filing', desc: 'Commission drawings, attorney review, file provisional application' },
                      { week: 'Months 2-11', title: 'Development', desc: 'Build prototype, gather test data, prepare for non-provisional' },
                      { week: 'Month 12', title: 'Non-Provisional', desc: 'File non-provisional application with enhanced claims and data' },
                      { week: 'Years 2-3', title: 'Examination', desc: 'Respond to office actions, negotiate claims with examiner' }
                    ].map((phase, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{phase.week}: {phase.title}</h4>
                          <p className="text-gray-600">{phase.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="checklist">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Patent Filing Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete checklist functionality coming soon. Track your progress through the patent filing process.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Load Checklist
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Prior Art Search Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Learn how to effectively search for prior art to understand the patent landscape.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="https://patents.google.com" target="_blank" rel="noopener noreferrer"
                       className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all">
                      <h3 className="font-bold text-gray-900 mb-2">Google Patents</h3>
                      <p className="text-sm text-gray-600">Best free search tool with excellent interface</p>
                    </a>
                    
                    <a href="https://patft.uspto.gov" target="_blank" rel="noopener noreferrer"
                       className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all">
                      <h3 className="font-bold text-gray-900 mb-2">USPTO PatFT</h3>
                      <p className="text-sm text-gray-600">Official full-text database</p>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Cost Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Patent cost calculator functionality coming soon. Estimate total costs for your patent application.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Timeline Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Patent timeline tool coming soon. Calculate key dates and deadlines based on your filing date.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attorney">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Attorney Meeting Preparation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Attorney meeting guide coming soon. Prepare for your patent attorney consultation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Claims Strength Analyzer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Claims analyzer coming soon. Evaluate the strength of your patent claims.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Patent Resources & Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">Official USPTO Resources</h3>
                    <ul className="space-y-2">
                      {[
                        { name: 'USPTO Homepage', url: 'https://www.uspto.gov' },
                        { name: 'Patent Basics', url: 'https://www.uspto.gov/patents/basics' },
                        { name: 'How to Apply', url: 'https://www.uspto.gov/patents/apply' }
                      ].map((link, idx) => (
                        <li key={idx}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                             className="text-purple-600 hover:text-purple-800 hover:underline">
                            {link.name} →
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}