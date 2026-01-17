import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, Code, Globe, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function EmbedGuidePage() {
  const appUrl = window.location.origin;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const wordpressCode = `<!-- Add to your WordPress theme's footer.php or use a plugin like "Insert Headers and Footers" -->

<!-- Cloud Connect Chat Widget -->
<div id="cloudconnect-chat"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${appUrl}/chat';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;';
    document.body.appendChild(iframe);
  })();
</script>`;

  const goHighLevelCode = `<!-- Add to Settings > Custom Code > Footer Code -->

<div id="cloudconnect-chat"></div>
<script>
  window.addEventListener('load', function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${appUrl}/chat';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;';
    document.body.appendChild(iframe);
  });
</script>`;

  const genericCode = `<!-- Add this code before the closing </body> tag -->

<div id="cloudconnect-chat"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${appUrl}/chat';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;';
    
    // Add floating button
    var button = document.createElement('button');
    button.innerHTML = '💬';
    button.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#10b981;color:white;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9998;';
    
    iframe.style.display = 'none';
    
    button.onclick = function() {
      if (iframe.style.display === 'none') {
        iframe.style.display = 'block';
        button.style.display = 'none';
      }
    };
    
    // Close button in iframe (add message listener)
    window.addEventListener('message', function(e) {
      if (e.data === 'close-chat') {
        iframe.style.display = 'none';
        button.style.display = 'block';
      }
    });
    
    document.body.appendChild(button);
    document.body.appendChild(iframe);
  })();
</script>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Embed Cloud Connect Chat Anywhere
          </h1>
          <p className="text-xl text-gray-600">
            Add secure, encrypted chat to any website or platform in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-600" />
                Easy Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Copy and paste a simple code snippet - no complex setup required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                Works Everywhere
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                WordPress, GoHighLevel, Webflow, or any HTML website
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                Always Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                End-to-end encryption maintained across all platforms
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integration Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wordpress">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                <TabsTrigger value="gohighlevel">GoHighLevel</TabsTrigger>
                <TabsTrigger value="generic">Any Website</TabsTrigger>
              </TabsList>

              <TabsContent value="wordpress" className="space-y-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{wordpressCode}</code>
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => copyToClipboard(wordpressCode)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://wordpress.org/plugins/" target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      WordPress Guide
                    </a>
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">WordPress Installation Steps:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to Appearance → Theme Editor</li>
                    <li>Select footer.php or use "Insert Headers and Footers" plugin</li>
                    <li>Paste the code before closing &lt;/body&gt; tag</li>
                    <li>Save changes</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="gohighlevel" className="space-y-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{goHighLevelCode}</code>
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => copyToClipboard(goHighLevelCode)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://help.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      GoHighLevel Docs
                    </a>
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">GoHighLevel Installation Steps:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to Settings → Custom Code</li>
                    <li>Click on "Footer Code" section</li>
                    <li>Paste the code</li>
                    <li>Save and publish</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="generic" className="space-y-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{genericCode}</code>
                  </pre>
                </div>
                <Button onClick={() => copyToClipboard(genericCode)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Generic Installation:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open your website's HTML</li>
                    <li>Find the closing &lt;/body&gt; tag</li>
                    <li>Paste the code just before it</li>
                    <li>Save and deploy</li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Position</h4>
              <p className="text-sm text-gray-600 mb-2">
                Change the position by modifying the CSS:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Bottom right: <code className="bg-gray-100 px-2 py-1 rounded">bottom:20px;right:20px;</code></li>
                <li>• Bottom left: <code className="bg-gray-100 px-2 py-1 rounded">bottom:20px;left:20px;</code></li>
                <li>• Custom: Adjust the pixel values as needed</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Size</h4>
              <p className="text-sm text-gray-600 mb-2">
                Adjust width and height:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">width:400px;height:600px;</code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Mobile Responsiveness</h4>
              <p className="text-sm text-gray-600">
                The widget automatically adjusts for mobile devices. On screens smaller than 768px, it will take up the full screen when opened.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}