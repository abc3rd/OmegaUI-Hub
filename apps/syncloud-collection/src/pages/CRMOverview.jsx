import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Contact,
  Users,
  UserCheck,
  Mail,
  ArrowRight,
  TrendingUp,
  Target,
  Heart,
  Building
} from 'lucide-react';
import { Contact as ContactEntity } from '@/entities/Contact';
import { Lead } from '@/entities/Lead';
import { EmailCampaign } from '@/entities/EmailCampaign';

export default function CRMOverview() {
  const [crmStats, setCrmStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCRMStats();
  }, []);

  const loadCRMStats = async () => {
    try {
      const [contacts, leads, campaigns] = await Promise.all([
        ContactEntity.list(),
        Lead.list(),
        EmailCampaign.list()
      ]);

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newContactsThisWeek = contacts.filter(c => new Date(c.created_date) > weekAgo).length;
      const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
      const activeCampaigns = campaigns.filter(c => c.status === 'sent').length;

      setCrmStats({
        totalContacts: contacts.length,
        newContactsThisWeek: newContactsThisWeek,
        totalLeads: leads.length,
        qualifiedLeads: qualifiedLeads,
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns,
        conversionRate: leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0
      });
    } catch (error) {
      console.error('Failed to load CRM stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
          <Contact className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">CRM & Contacts</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build and nurture your professional network with comprehensive contact management, lead tracking, 
            and email campaign tools designed to grow your business relationships.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">Relationship Management</Badge>
          <Badge className="bg-green-100 text-green-800">Lead Conversion</Badge>
          <Badge className="bg-purple-100 text-purple-800">Email Marketing</Badge>
        </div>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : crmStats.totalContacts}</div>
                <div className="text-xs text-green-600">+{crmStats.newContactsThisWeek} this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : crmStats.totalLeads}</div>
                <div className="text-xs text-muted-foreground">{crmStats.qualifiedLeads} qualified</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Email Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : crmStats.totalCampaigns}</div>
                <div className="text-xs text-muted-foreground">{crmStats.activeCampaigns} sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div className="text-2xl font-bold">{loading ? '...' : `${crmStats.conversionRate}%`}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            What is CRM & Contacts?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            CRM & Contacts is your comprehensive relationship management hub that helps you build, maintain, and leverage 
            your professional network. From initial lead capture to long-term relationship nurturing, these tools provide 
            everything you need to grow your business through meaningful connections.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Complete contact database management</li>
                <li>• Lead tracking and qualification</li>
                <li>• Email campaign creation and tracking</li>
                <li>• Contact interaction history</li>
                <li>• Import/export capabilities</li>
                <li>• Advanced search and filtering</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Sales professionals and teams</li>
                <li>• Small business owners</li>
                <li>• Consultants and freelancers</li>
                <li>• Network marketers</li>
                <li>• Anyone building business relationships</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">CRM Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl('Contacts')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Contact Manager
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Organize and manage your professional contacts with detailed profiles, interaction history, 
                  and powerful search capabilities.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Contact Database</Badge>
                  <Badge variant="outline">Search & Filter</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Leads')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-orange-500" />
                    Lead Tracker
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Track potential customers through your sales pipeline, manage lead sources, 
                  and convert qualified leads into contacts.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Pipeline Management</Badge>
                  <Badge variant="outline">Lead Qualification</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('EmailCampaigns')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-500" />
                    Email Campaigns
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create, manage, and track email marketing campaigns to stay connected with your 
                  network and nurture business relationships.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Email Marketing</Badge>
                  <Badge variant="outline">Campaign Tracking</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Relationship Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Build genuine, lasting business relationships by keeping detailed records of interactions, 
              preferences, and important dates for each contact in your network.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Growth Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor your network growth, track lead conversion rates, and measure the effectiveness 
              of your relationship-building efforts with detailed analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-purple-500" />
              Strategic Outreach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plan and execute targeted outreach campaigns, follow up with prospects systematically, 
              and maintain consistent communication with your network.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with CRM & Contacts</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Import Your Contacts</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by importing your existing contacts or manually adding key relationships. 
                Organize them with tags and detailed notes for better management.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Set Up Lead Tracking</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create a system for capturing and qualifying new leads. Track their progress 
                through your sales process and convert qualified leads to contacts.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('Contacts')}>Manage Contacts</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('Leads')}>Track Leads</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}