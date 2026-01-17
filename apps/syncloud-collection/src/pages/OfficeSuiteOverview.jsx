import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  FileText,
  Sheet,
  Presentation,
  ArrowRight,
  Save,
  Edit,
  Share,
  Folder
} from 'lucide-react';
import { Document } from '@/entities/Document';
import { Spreadsheet } from '@/entities/Spreadsheet';
import { Presentation as PresentationEntity } from '@/entities/Presentation';

export default function OfficeSuiteOverview() {
  const [officeStats, setOfficeStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficeStats();
  }, []);

  const loadOfficeStats = async () => {
    try {
      const [documents, spreadsheets, presentations] = await Promise.all([
        Document.list(),
        Spreadsheet.list(),
        PresentationEntity.list()
      ]);

      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentDocs = documents.filter(d => new Date(d.created_date) > thisWeek).length;

      setOfficeStats({
        totalDocuments: documents.length,
        totalSpreadsheets: spreadsheets.length,
        totalPresentations: presentations.length,
        recentDocuments: recentDocs,
        totalFiles: documents.length + spreadsheets.length + presentations.length
      });
    } catch (error) {
      console.error('Failed to load office stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Office Suite</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete office productivity tools for creating, editing, and managing documents, spreadsheets, 
            and presentations. Everything you need for professional document creation and collaboration.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">Document Creation</Badge>
          <Badge className="bg-green-100 text-green-800">Data Analysis</Badge>
          <Badge className="bg-purple-100 text-purple-800">Professional Presentations</Badge>
        </div>
      </div>

      {/* Office Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="text-2xl font-bold">{loading ? '...' : officeStats.totalDocuments}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Spreadsheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sheet className="w-8 h-8 text-green-500" />
              <div className="text-2xl font-bold">{loading ? '...' : officeStats.totalSpreadsheets}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Presentations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Presentation className="w-8 h-8 text-purple-500" />
              <div className="text-2xl font-bold">{loading ? '...' : officeStats.totalPresentations}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Folder className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : officeStats.totalFiles}</div>
                <div className="text-xs text-green-600">+{officeStats.recentDocuments} this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            What is Office Suite?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Office Suite provides you with professional-grade tools for all your document creation needs. From rich-text 
            documents and data analysis spreadsheets to compelling presentations, you have everything needed to create, 
            edit, and manage professional content that meets business standards.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Rich text document editor</li>
                <li>• Advanced spreadsheet calculations</li>
                <li>• Professional presentation designer</li>
                <li>• Real-time auto-saving</li>
                <li>• Export to multiple formats</li>
                <li>• Template library</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Business professionals</li>
                <li>• Students and educators</li>
                <li>• Project managers</li>
                <li>• Consultants and freelancers</li>
                <li>• Team collaboration</li>
                <li>• Report creation and analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Office Applications</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl('DocEditor')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Documents
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create and edit professional documents with rich formatting, tables, images, and advanced 
                  text editing capabilities. Perfect for reports, letters, and proposals.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Rich Text Editor</Badge>
                  <Badge variant="outline">Professional Formatting</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SheetEditor')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sheet className="w-5 h-5 text-green-500" />
                    Spreadsheets
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Powerful spreadsheet application with formulas, charts, and data analysis tools. 
                  Organize data, perform calculations, and create visual reports.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Advanced Formulas</Badge>
                  <Badge variant="outline">Data Analysis</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SlideEditor')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-purple-500" />
                    Presentations
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Design compelling presentations with professional templates, animations, and multimedia 
                  support. Create slide decks that engage and inform your audience.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Professional Templates</Badge>
                  <Badge variant="outline">Multimedia Support</Badge>
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
              <Save className="w-5 h-5 text-blue-500" />
              Auto-Save & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Never lose your work with automatic saving and secure cloud storage. Your documents 
              are protected and accessible whenever you need them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="w-5 h-5 text-green-500" />
              Professional Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create documents that meet professional standards with advanced formatting, 
              typography, and layout options that make your content look polished and credible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share className="w-5 h-5 text-purple-500" />
              Easy Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Share your work easily with export options for multiple formats including PDF, 
              Word, Excel, and PowerPoint. Collaborate seamlessly with team members.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Office Suite</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Create Your First Document</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start with the document editor to create professional reports, letters, or proposals. 
                Explore the formatting options and templates available.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Organize Data in Spreadsheets</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use spreadsheets for data analysis, budgeting, or project tracking. Take advantage 
                of formulas and charts to visualize your information.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('DocEditor')}>Create Document</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('SheetEditor')}>New Spreadsheet</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}