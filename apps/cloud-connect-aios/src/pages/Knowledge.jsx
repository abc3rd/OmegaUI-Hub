import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Upload, FileText, Mic } from 'lucide-react';

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSearch = () => {
    if (!searchTerm) return;
    // Simulate AI search through documents
    setAnswer(`Based on the document "MSA_Agreement.pdf", the key terms include a 24-month service period, a net-30 payment schedule, and a confidentiality clause covering all shared information.`);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <label htmlFor="file-upload" className="w-full">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400">
              <Upload className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">
                Tap to upload documents (PDF, DOCX, TXT)
              </p>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-2 items-center">
        <Input 
          placeholder="Ask a question about your documents..."
          className="bg-gray-800 border-gray-700 text-white"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-cyan-400"><Mic className="h-5 w-5" /></Button>
        <Button onClick={handleSearch} className="bg-cyan-500 hover:bg-cyan-600"><Search className="h-5 w-5" /></Button>
      </div>

      {answer && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-1 text-cyan-400 flex-shrink-0"/>
                  <p className="text-white">{answer}</p>
              </div>
            </CardContent>
          </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
        <ul className="space-y-2">
            <li className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-400"/>
                    <span>MSA_Agreement.pdf</span>
                </div>
                <span className="text-xs text-gray-500">2.1 MB</span>
            </li>
            <li className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-400"/>
                    <span>Project_Brief.docx</span>
                </div>
                <span className="text-xs text-gray-500">876 KB</span>
            </li>
        </ul>
      </div>
    </div>
  );
}