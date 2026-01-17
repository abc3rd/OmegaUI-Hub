import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Tablet,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function SiteExplorer() {
  const [url, setUrl] = useState('https://base44.com');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadWebsite = () => {
    if (!url.trim()) return;
    
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    setCurrentUrl(formattedUrl);
    setIsLoaded(true);
    setAnalysisData(null);
    setIsAnalyzing(true);
    
    // Simulate analysis data fetching
    setTimeout(() => {
      setAnalysisData({
        title: 'Website Analysis',
        loadTime: Math.floor(Math.random() * 2000) + 500,
        size: (Math.random() * 5 + 0.5).toFixed(1),
        requests: Math.floor(Math.random() * 50) + 20,
        status: Math.random() > 0.3 ? 'success' : 'warning',
        seoScore: Math.floor(Math.random() * 40) + 60,
        performance: Math.floor(Math.random() * 30) + 70
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const refreshSite = () => {
    if (currentUrl) {
      const iframe = document.getElementById('siteFrame');
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  const openExternal = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto border-8 border-gray-800 rounded-[2.5rem] overflow-hidden';
      case 'tablet':
        return 'max-w-4xl mx-auto border-4 border-gray-600 rounded-xl overflow-hidden';
      default:
        return 'w-full border border-gray-300 rounded-lg overflow-hidden';
    }
  };

  const getFrameHeight = () => {
    switch (viewMode) {
      case 'mobile':
        return 'h-[600px]';
      case 'tablet':
        return 'h-[768px]';
      default:
        return 'h-[800px]';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Site Explorer</h1>
            <p className="text-slate-600">View and analyze websites with responsive preview</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* URL Input and Controls */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Globe className="w-5 h-5" />
                Website Viewer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL (e.g., example.com)"
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={loadWebsite} className="bg-blue-600 hover:bg-blue-700">
                    <Globe className="w-4 h-4 mr-2" />
                    Load Site
                  </Button>
                </div>
              </div>

              {isLoaded && currentUrl && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="w-4 h-4" />
                    <span className="font-mono">{currentUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mr-4">
                      <Button
                        variant={viewMode === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('desktop')}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('tablet')}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('mobile')}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={refreshSite} size="sm" variant="outline">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button onClick={openExternal} size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Website Analysis */}
          {(isAnalyzing || analysisData) && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {isAnalyzing ? "Analyzing..." : "Analysis Results"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="text-center p-4 bg-slate-100 rounded-lg">
                        <div className="h-7 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                ) : analysisData && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{analysisData.loadTime}ms</div>
                        <div className="text-sm text-slate-600">Load Time</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{analysisData.size}MB</div>
                        <div className="text-sm text-slate-600">Page Size</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{analysisData.requests}</div>
                        <div className="text-sm text-slate-600">Requests</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{analysisData.seoScore}/100</div>
                        <div className="text-sm text-slate-600">SEO Score</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Badge 
                        variant={analysisData.status === 'success' ? 'default' : 'secondary'}
                        className={analysisData.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {analysisData.status === 'success' ? 'Good Performance' : 'Needs Improvement'}
                      </Badge>
                      <Badge variant="outline">
                        Performance: {analysisData.performance}/100
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Website Preview */}
          {isLoaded && currentUrl && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Monitor className="w-5 h-5" />
                  Website Preview - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-6 rounded-lg">
                  <div className={getViewportStyles()}>
                    <iframe
                      id="siteFrame"
                      src={currentUrl}
                      className={`w-full ${getFrameHeight()} bg-white`}
                      title="Website Preview"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Some websites may not load due to security policies (X-Frame-Options). 
                    Use the external link button to view in a new tab if the site doesn't display.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}