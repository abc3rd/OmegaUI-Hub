
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Share2, 
  ArrowRight, 
  Database,
  FileText,
  Mail,
  Code
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createPageUrl } from '@/utils';

const INTEGRATION_TOOLS = [
  {
    id: 'contacts',
    name: 'Contact Manager',
    icon: Database,
    description: 'Import contacts from CSV data',
    page: 'Contacts',
    acceptsCSV: true
  },
  {
    id: 'email-campaigns',
    name: 'Email Campaigns',
    icon: Mail,
    description: 'Use CSV for email recipient lists',
    page: 'EmailCampaigns',
    acceptsCSV: true
  },
  {
    id: 'code-snippets',
    name: 'Code Snippets',
    icon: Code,
    description: 'Convert CSV to code templates',
    page: 'CodeSnippets',
    acceptsCSV: false
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    icon: FileText,
    description: 'Generate content from CSV data',
    page: 'ContentWriter',
    acceptsCSV: false
  }
];

export default function CsvProcessor() {
  const csvWrapperRef = useRef(null);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  const initializeCsvTool = useCallback(() => {
    // Load PapaParse if not already loaded
    if (!window.Papa) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
      script.onload = () => setupCsvLogic();
      document.head.appendChild(script);
    } else {
      setupCsvLogic();
    }
  }, []); // Empty dependency array for useCallback because setupCsvLogic is defined inside and captures state/refs from the outer scope, which will be stable.

  useEffect(() => {
    // Initialize the CSV tool functionality
    if (csvWrapperRef.current) {
      initializeCsvTool();
    }
  }, [initializeCsvTool]);

  const setupCsvLogic = () => {
    // Enhanced CSV logic with integration capabilities
    let csvData = [];
    let originalHeaders = [];
    let fileInfo = null;
    let splitMethod = 'rows';
    let selectedColumns = new Set();

    // Utility functions
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `csv-toast ${type}`;
      toast.textContent = message;
      csvWrapperRef.current.appendChild(toast);
      
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
      }, 4000);
    }

    function showLoading(show) {
      const loadingEl = csvWrapperRef.current.querySelector('#csvLoadingIndicator');
      if (loadingEl) {
        loadingEl.classList.toggle('csv-hidden', !show);
      }
    }

    function resetState() {
      csvData = [];
      originalHeaders = [];
      fileInfo = null;
      selectedColumns = new Set();
      
      const elements = [
        '#csvFileInfoCard',
        '#csvPreviewCard', 
        '#csvDownloadCard'
      ];
      
      elements.forEach(selector => {
        const el = csvWrapperRef.current.querySelector(selector);
        if (el) el.classList.add('csv-hidden');
      });
      
      const processBtn = csvWrapperRef.current.querySelector('#csvProcessBtn');
      if (processBtn) processBtn.disabled = true;
    }

    // File upload handler
    const fileInput = csvWrapperRef.current.querySelector('#csvFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        resetState();
        showLoading(true);
        
        if (!file.name.toLowerCase().endsWith('.csv')) {
          showToast("Invalid file type. Please upload a .csv file.", "error");
          showLoading(false);
          return;
        }
        
        window.Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          complete: function(results) {
            if (results.errors.length > 0) {
              showToast(`File Parsing Error: ${results.errors[0].message}`, "error");
              showLoading(false);
              return;
            }
            
            const [headers, ...data] = results.data;
            originalHeaders = headers || [];
            csvData = data || [];
            
            fileInfo = {
              name: file.name,
              size: formatFileSize(file.size),
              rows: data.length,
              columns: headers.length
            };
            
            selectedColumns = new Set(originalHeaders.map((_, i) => i));
            
            displayFileInfo();
            displayPreview();
            updateConfigPanel();
            
            const processBtn = csvWrapperRef.current.querySelector('#csvProcessBtn');
            if (processBtn) processBtn.disabled = false;
            
            showLoading(false);
            showToast("File uploaded and parsed successfully!", "success");
          },
          error: function(error) {
            showToast("An unexpected error occurred during parsing.", "error");
            showLoading(false);
          }
        });
      });
    }

    // Method selection buttons
    const methodButtons = csvWrapperRef.current.querySelectorAll('.csv-method-btn');
    methodButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        methodButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        splitMethod = this.dataset.method;
        updateConfigPanel();
      });
    });

    function displayFileInfo() {
      const infoEl = csvWrapperRef.current.querySelector('#csvFileInfo');
      if (infoEl) {
        const infoHTML = `
          <div class="csv-info-label">Filename:</div><div>${fileInfo.name}</div>
          <div class="csv-info-label">Size:</div><div>${fileInfo.size}</div>
          <div class="csv-info-label">Rows:</div><div>${fileInfo.rows}</div>
          <div class="csv-info-label">Columns:</div><div>${fileInfo.columns}</div>
        `;
        infoEl.innerHTML = infoHTML;
        
        const infoCard = csvWrapperRef.current.querySelector('#csvFileInfoCard');
        if (infoCard) infoCard.classList.remove('csv-hidden');
      }
    }

    function displayPreview() {
      const previewEl = csvWrapperRef.current.querySelector('#csvPreviewTable');
      if (previewEl) {
        const previewRows = csvData.slice(0, 5);
        let tableHTML = '<table><thead><tr>';
        
        originalHeaders.forEach(header => {
          tableHTML += `<th>${header || 'Column'}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        previewRows.forEach(row => {
          tableHTML += '<tr>';
          row.forEach(cell => {
            tableHTML += `<td>${cell || ''}</td>`;
          });
          tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        previewEl.innerHTML = tableHTML;
        
        const noteEl = csvWrapperRef.current.querySelector('#csvPreviewNote');
        if (csvData.length > 5 && noteEl) {
          noteEl.textContent = `... and ${csvData.length - 5} more rows`;
          noteEl.classList.remove('csv-hidden');
        }
        
        const previewCard = csvWrapperRef.current.querySelector('#csvPreviewCard');
        if (previewCard) previewCard.classList.remove('csv-hidden');
      }
    }

    // Column selection functions
    window.csvToggleColumn = function(index) {
      if (selectedColumns.has(index)) {
        selectedColumns.delete(index);
      } else {
        selectedColumns.add(index);
      }
      updateColumnCount();
    };

    window.csvSelectAllColumns = function() {
      selectedColumns = new Set(originalHeaders.map((_, i) => i));
      updateConfigPanel();
    };

    window.csvClearAllColumns = function() {
      selectedColumns = new Set();
      updateConfigPanel();
    };

    function updateColumnCount() {
      const label = csvWrapperRef.current.querySelector('#csvConfigPanel .csv-input-group label');
      if (label && label.textContent.includes('Select Columns')) {
        label.textContent = `Select Columns (${selectedColumns.size} selected):`;
      }
    }

    function updateConfigPanel() {
      const panel = csvWrapperRef.current.querySelector('#csvConfigPanel');
      if (!panel) return;
      
      switch(splitMethod) {
        case 'rows':
          panel.innerHTML = `
            <div class="csv-input-group">
              <label>Rows per file:</label>
              <input type="number" id="csvRowsPerFile" value="1000" min="1">
            </div>
          `;
          break;
        case 'size':
          panel.innerHTML = `
            <div class="csv-input-group">
              <label>Max file size (MB):</label>
              <input type="number" id="csvMaxFileSize" value="25" min="1">
            </div>
          `;
          break;
        case 'columns':
        case 'custom':
          let configHTML = `
            <div class="csv-input-group">
              <label>Select Columns (${selectedColumns.size} selected):</label>
              <div class="csv-column-grid">
          `;
          
          originalHeaders.forEach((header, index) => {
            const isSelected = selectedColumns.has(index);
            configHTML += `
              <div class="csv-column-item">
                <input type="checkbox" id="csvCol_${index}" ${isSelected ? 'checked' : ''} 
                       onchange="csvToggleColumn(${index})">
                <label for="csvCol_${index}">${header || `Column ${index + 1}`}</label>
              </div>
            `;
          });
          
          configHTML += `
              </div>
              <div class="csv-button-row">
                <button class="csv-small-btn" onclick="csvSelectAllColumns()">All</button>
                <button class="csv-small-btn" onclick="csvClearAllColumns()">None</button>
              </div>
            </div>
          `;
          
          if (splitMethod === 'custom') {
            configHTML += `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid rgba(253,198,0,0.2);">
                <div class="csv-input-group">
                  <label>Start Row:</label>
                  <input type="number" id="csvStartRow" value="1" min="1" max="${csvData.length}">
                </div>
                <div class="csv-input-group">
                  <label>End Row:</label>
                  <input type="number" id="csvEndRow" value="${csvData.length}" min="1" max="${csvData.length}">
                </div>
              </div>
            `;
          }
          
          panel.innerHTML = configHTML;
          break;
      }
    }

    // Enhanced process function with integration
    const processBtn = csvWrapperRef.current.querySelector('#csvProcessBtn');
    if (processBtn) {
      processBtn.addEventListener('click', function() {
        if (csvData.length === 0) {
          showToast("Please upload a file first.", "error");
          return;
        }
        
        showLoading(true);
        const downloadCard = csvWrapperRef.current.querySelector('#csvDownloadCard');
        if (downloadCard) downloadCard.classList.add('csv-hidden');
        
        setTimeout(() => {
          try {
            const files = generateFiles();
            setProcessedFiles(files); // Store for React state
            displayDownloads(files);
            showToast(`Generated ${files.length} file(s) for download.`, "success");
          } catch (error) {
            showToast(`Processing Error: ${error.message}`, "error");
          } finally {
            showLoading(false);
          }
        }, 100);
      });
    }

    function generateFiles() {
      const baseName = fileInfo.name.replace(/\.[^/.]+$/, "");
      const files = [];
      
      function getSelectedData(data) {
        const sortedIndices = Array.from(selectedColumns).sort((a, b) => a - b);
        return {
          headers: sortedIndices.map(i => originalHeaders[i]),
          data: data.map(row => sortedIndices.map(i => row[i]))
        };
      }
      
      switch (splitMethod) {
        case 'rows':
          const rowsPerFile = parseInt(csvWrapperRef.current.querySelector('#csvRowsPerFile')?.value) || 1000;
          const { headers, data } = getSelectedData(csvData);
          
          for (let i = 0; i < data.length; i += rowsPerFile) {
            const chunk = data.slice(i, i + rowsPerFile);
            const content = window.Papa.unparse([headers, ...chunk]);
            files.push({
              name: `${baseName}_rows_${i + 1}-${i + chunk.length}.csv`,
              content: content,
              headers: headers,
              data: chunk
            });
          }
          break;
          
        case 'size':
          const maxFileSize = parseInt(csvWrapperRef.current.querySelector('#csvMaxFileSize')?.value) || 25;
          const maxSizeInBytes = maxFileSize * 1024 * 1024;
          const { headers: sizeHeaders, data: sizeData } = getSelectedData(csvData);
          
          let currentChunk = [];
          let currentSize = 0;
          let fileCount = 1;
          
          for (const row of sizeData) {
            const rowContent = window.Papa.unparse([row]);
            if (currentSize + rowContent.length > maxSizeInBytes && currentChunk.length > 0) {
              const content = window.Papa.unparse([sizeHeaders, ...currentChunk]);
              files.push({
                name: `${baseName}_part_${fileCount}.csv`,
                content: content,
                headers: sizeHeaders,
                data: [...currentChunk]
              });
              currentChunk = [];
              currentSize = 0;
              fileCount++;
            }
            currentChunk.push(row);
            currentSize += rowContent.length;
          }
          
          if (currentChunk.length > 0) {
            const content = window.Papa.unparse([sizeHeaders, ...currentChunk]);
            files.push({
              name: `${baseName}_part_${fileCount}.csv`,
              content: content,
              headers: sizeHeaders,
              data: [...currentChunk]
            });
          }
          break;
          
        case 'columns':
          const { headers: colHeaders, data: colData } = getSelectedData(csvData);
          const content = window.Papa.unparse([colHeaders, ...colData]);
          files.push({
            name: `${baseName}_selected_columns.csv`,
            content: content,
            headers: colHeaders,
            data: colData
          });
          break;
          
        case 'custom':
          const startRow = parseInt(csvWrapperRef.current.querySelector('#csvStartRow')?.value) || 1;
          const endRow = parseInt(csvWrapperRef.current.querySelector('#csvEndRow')?.value) || csvData.length;
          const customData = csvData.slice(startRow - 1, endRow);
          const { headers: customHeaders, data: customDataProcessed } = getSelectedData(customData);
          const customContent = window.Papa.unparse([customHeaders, ...customDataProcessed]);
          files.push({
            name: `${baseName}_custom_${startRow}-${endRow}.csv`,
            content: customContent,
            headers: customHeaders,
            data: customDataProcessed
          });
          break;
      }
      
      return files;
    }

    function displayDownloads(files) {
      const downloadList = csvWrapperRef.current.querySelector('#csvDownloadList');
      if (!downloadList) return;
      
      let downloadHTML = '';
      
      files.forEach((file, index) => {
        const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const size = formatFileSize(blob.size);
        
        downloadHTML += `
          <div class="csv-download-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <a href="${url}" download="${file.name}" class="csv-download-link">
                💾 ${file.name}
              </a>
              <span class="csv-file-size">${size}</span>
            </div>
            <button class="csv-small-btn" onclick="window.showIntegrationOptions(${index})" style="background: linear-gradient(135deg, #45BC9B, #BF546E); color: white; border: none;">
              🔗 Send to Tool
            </button>
          </div>
        `;
      });
      
      const downloadCard = csvWrapperRef.current.querySelector('#csvDownloadCard');
      if (downloadCard) {
        downloadList.innerHTML = downloadHTML;
        downloadCard.classList.remove('csv-hidden');
      }
    }

    // Make integration function available globally
    window.showIntegrationOptions = (fileIndex) => {
      const file = processedFiles[fileIndex];
      if (file) {
        setSelectedTool({ fileIndex, file });
        setShowIntegrationDialog(true);
      }
    };
  };

  const handleToolIntegration = (tool, file) => {
    // Store file data in sessionStorage for the target tool to access
    const integrationData = {
      source: 'csv-processor',
      fileName: file.name,
      headers: file.headers,
      data: file.data,
      fullContent: file.content,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('toolIntegrationData', JSON.stringify(integrationData));
    
    // Navigate to the selected tool
    window.location.href = createPageUrl(tool.page);
    
    setShowIntegrationDialog(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              CSV Control Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced file formatting, splitting, and tool integration
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            File Processing
          </Badge>
          <Badge variant="outline">
            <Share2 className="w-3 h-3 mr-1" />
            Tool Integration
          </Badge>
          <Badge variant="outline">
            Multi-Format Export
          </Badge>
        </div>
      </div>

      {/* CSV Tool Wrapper */}
      <div ref={csvWrapperRef}>
        <div id="ghl-csv-wrapper" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              #ghl-csv-wrapper * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              #ghl-csv-wrapper {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #0B0E12;
                color: #E0E0E0;
                min-height: 100vh;
                padding: 1rem;
              }
              #ghl-csv-wrapper .csv-container { 
                max-width: 1200px; 
                margin: 0 auto; 
              }
              #ghl-csv-wrapper .csv-header {
                background: linear-gradient(135deg, #BF546E, #45BC9B);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 8px 32px rgba(191,84,110,0.3);
              }
              #ghl-csv-wrapper .csv-header h1 { 
                font-size: 2.5rem; 
                color: white; 
                margin-bottom: 0.5rem; 
              }
              #ghl-csv-wrapper .csv-header p { 
                color: rgba(255,255,255,0.9); 
                font-size: 1.1rem; 
              }
              
              #ghl-csv-wrapper .csv-grid { 
                display: grid; 
                gap: 1.5rem; 
              }
              #ghl-csv-wrapper .csv-grid-2 { 
                grid-template-columns: 2fr 1fr; 
              }
              @media (max-width: 768px) { 
                #ghl-csv-wrapper .csv-grid-2 { 
                  grid-template-columns: 1fr; 
                } 
              }
              
              #ghl-csv-wrapper .csv-card {
                background: #242439;
                border: 1px solid rgba(253, 198, 0, 0.2);
                border-radius: 12px;
                padding: 1.5rem;
              }
              #ghl-csv-wrapper .csv-card-header {
                color: #FDC600;
                font-size: 1.25rem;
                font-weight: bold;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              
              #ghl-csv-wrapper .csv-upload-area {
                border: 3px dashed #FDC600;
                border-radius: 12px;
                padding: 3rem 1rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: linear-gradient(to bottom right, rgba(253,198,0,0.05), rgba(38,153,254,0.05));
                position: relative;
              }
              #ghl-csv-wrapper .csv-upload-area:hover {
                border-color: #2699FE;
                background: linear-gradient(to bottom right, rgba(38,153,254,0.1), rgba(69,188,155,0.1));
              }
              #ghl-csv-wrapper .csv-upload-area input { 
                position: absolute; 
                opacity: 0; 
                pointer-events: none; 
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
              }
              #ghl-csv-wrapper .csv-upload-title { 
                font-size: 1.25rem; 
                color: #FDC600; 
                margin-bottom: 0.5rem; 
              }
              #ghl-csv-wrapper .csv-upload-subtitle { 
                color: #2699FE; 
              }
              
              #ghl-csv-wrapper .csv-info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: linear-gradient(to right, rgba(38,153,254,0.1), rgba(253,198,0,0.1));
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #2699FE;
              }
              #ghl-csv-wrapper .csv-info-label { 
                font-weight: bold; 
                color: #FDC600; 
              }
              
              #ghl-csv-wrapper .csv-method-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
                margin-bottom: 1rem;
              }
              #ghl-csv-wrapper .csv-method-btn {
                padding: 0.75rem;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                text-transform: capitalize;
                border: none;
              }
              #ghl-csv-wrapper .csv-method-btn.active {
                background: linear-gradient(135deg, #BF546E, #45BC9B);
                color: white;
              }
              #ghl-csv-wrapper .csv-method-btn:not(.active) {
                background: transparent;
                border: 1px solid rgba(253,198,0,0.5);
                color: #FDC600;
              }
              #ghl-csv-wrapper .csv-method-btn:not(.active):hover { 
                background: rgba(253,198,0,0.1); 
              }
              
              #ghl-csv-wrapper .csv-config-panel {
                background: rgba(0,0,0,0.2);
                padding: 1rem;
                border-radius: 8px;
              }
              
              #ghl-csv-wrapper .csv-input-group { 
                margin-bottom: 1rem; 
              }
              #ghl-csv-wrapper .csv-input-group label {
                display: block;
                color: #FDC600;
                margin-bottom: 0.5rem;
                font-weight: 500;
              }
              #ghl-csv-wrapper .csv-input-group input {
                width: 100%;
                background: #1a1a2e;
                border: 2px solid #FDC600;
                border-radius: 6px;
                padding: 0.75rem;
                color: white;
                outline: none;
                transition: border-color 0.3s;
              }
              #ghl-csv-wrapper .csv-input-group input:focus { 
                border-color: #2699FE; 
              }
              
              #ghl-csv-wrapper .csv-column-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
                max-height: 200px;
                overflow-y: auto;
                padding: 0.5rem;
                background: rgba(0,0,0,0.3);
                border-radius: 6px;
              }
              #ghl-csv-wrapper .csv-column-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.875rem;
              }
              #ghl-csv-wrapper .csv-column-item:hover { 
                background: rgba(69,188,155,0.2); 
              }
              #ghl-csv-wrapper .csv-column-item input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #45BC9B;
              }
              
              #ghl-csv-wrapper .csv-button-row {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
              }
              #ghl-csv-wrapper .csv-small-btn {
                padding: 0.25rem 0.75rem;
                font-size: 0.75rem;
                border: 1px solid rgba(253,198,0,0.5);
                color: #FDC600;
                background: transparent;
                border-radius: 4px;
                cursor: pointer;
              }
              #ghl-csv-wrapper .csv-small-btn:hover { 
                background: rgba(253,198,0,0.1); 
              }
              
              #ghl-csv-wrapper .csv-process-btn {
                width: 100%;
                padding: 1rem;
                font-weight: bold;
                color: white;
                background: linear-gradient(135deg, #45BC9B, #BF546E);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
              }
              #ghl-csv-wrapper .csv-process-btn:hover {
                box-shadow: 0 4px 15px rgba(69,188,155,0.3);
                transform: translateY(-2px);
              }
              #ghl-csv-wrapper .csv-process-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
              }
              
              #ghl-csv-wrapper .csv-table-container {
                overflow-x: auto;
                max-height: 400px;
                border-radius: 8px;
                border: 1px solid rgba(253,198,0,0.2);
              }
              #ghl-csv-wrapper table { 
                width: 100%; 
                font-size: 0.875rem; 
              }
              #ghl-csv-wrapper th {
                background: linear-gradient(135deg, #BF546E, #45BC9B);
                color: white;
                padding: 0.75rem;
                text-align: left;
                font-weight: bold;
                position: sticky;
                top: 0;
                z-index: 1;
              }
              #ghl-csv-wrapper td {
                padding: 0.5rem 0.75rem;
                border-bottom: 1px solid rgba(253,198,0,0.2);
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              #ghl-csv-wrapper tr:nth-child(even) { 
                background: rgba(38,153,254,0.05); 
              }
              
              #ghl-csv-wrapper .csv-download-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: rgba(0,0,0,0.2);
                border: 1px solid rgba(69,188,155,0.3);
                border-radius: 8px;
                margin-bottom: 0.5rem;
              }
              #ghl-csv-wrapper .csv-download-link {
                color: #45BC9B;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s;
              }
              #ghl-csv-wrapper .csv-download-link:hover { 
                color: #FDC600; 
              }
              #ghl-csv-wrapper .csv-file-size { 
                color: #FDC600; 
                font-size: 0.875rem; 
              }
              
              #ghl-csv-wrapper .csv-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                color: #2699FE;
                padding: 1rem;
                background: #242439;
                border: 1px solid rgba(38,153,254,0.2);
                border-radius: 8px;
                margin: 1rem 0;
              }
              #ghl-csv-wrapper .csv-spinner {
                width: 24px;
                height: 24px;
                border: 3px solid rgba(38,153,254,0.3);
                border-top: 3px solid #2699FE;
                border-radius: 50%;
                animation: csv-spin 1s linear infinite;
              }
              @keyframes csv-spin { 
                to { transform: rotate(360deg); } 
              }
              
              #ghl-csv-wrapper .csv-toast {
                position: fixed;
                top: 1rem;
                right: 1rem;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
              }
              #ghl-csv-wrapper .csv-toast.show { 
                opacity: 1; 
                transform: translateX(0); 
              }
              #ghl-csv-wrapper .csv-toast.success { 
                background: linear-gradient(135deg, #45BC9B, #3aa989); 
              }
              #ghl-csv-wrapper .csv-toast.error { 
                background: linear-gradient(135deg, #BF546E, #ab4a60); 
              }
              
              #ghl-csv-wrapper .csv-hidden { 
                display: none; 
              }
            `
          }} />

          <div className="csv-container">
            <div className="csv-header">
              <h1>Cloud Connect CSV Control Center</h1>
              <p>Advanced File Formatting & Splitting Tool</p>
            </div>
            
            <div className="csv-grid csv-grid-2">
              <div className="csv-grid">
                <div className="csv-card">
                  <div className="csv-card-header">📁 File Upload</div>
                  <div className="csv-upload-area" onClick={() => document.getElementById('csvFileInput')?.click()}>
                    <div className="csv-upload-title">📁 Upload CSV File</div>
                    <div className="csv-upload-subtitle">Click here or drag and drop your file</div>
                    <input type="file" id="csvFileInput" accept=".csv" />
                  </div>
                </div>
                
                <div id="csvLoadingIndicator" className="csv-loading csv-hidden">
                  <div className="csv-spinner"></div>
                  <span>Processing...</span>
                </div>
                
                <div id="csvFileInfoCard" className="csv-card csv-hidden">
                  <div className="csv-card-header">📊 File Information</div>
                  <div className="csv-info-grid" id="csvFileInfo"></div>
                </div>
              </div>
              
              <div className="csv-card">
                <div className="csv-card-header">⚙️ Split Configuration</div>
                
                <div className="csv-method-buttons">
                  <button className="csv-method-btn active" data-method="rows">rows</button>
                  <button className="csv-method-btn" data-method="size">size</button>
                  <button className="csv-method-btn" data-method="columns">columns</button>
                  <button className="csv-method-btn" data-method="custom">custom</button>
                </div>
                
                <div className="csv-config-panel" id="csvConfigPanel">
                  <div id="csvRowsConfig">
                    <div className="csv-input-group">
                      <label>Rows per file:</label>
                      <input type="number" id="csvRowsPerFile" defaultValue="1000" min="1" />
                    </div>
                  </div>
                </div>
                
                <button className="csv-process-btn" id="csvProcessBtn" disabled>
                  ⚡ Process & Generate Files
                </button>
              </div>
            </div>
            
            <div id="csvPreviewCard" className="csv-card csv-hidden">
              <div className="csv-card-header">📋 Original Data Preview</div>
              <div className="csv-table-container" id="csvPreviewTable"></div>
              <div id="csvPreviewNote" className="csv-hidden" style={{ textAlign: 'center', marginTop: '1rem', color: '#FDC600', fontStyle: 'italic' }}></div>
            </div>
            
            <div id="csvDownloadCard" className="csv-card csv-hidden">
              <div className="csv-card-header">📥 Download Files</div>
              <div id="csvDownloadList"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Send to Tool
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>File:</strong> {selectedTool?.file?.name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Choose a tool to send this processed data to directly, or download for manual use.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATION_TOOLS.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card 
                    key={tool.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => handleToolIntegration(tool, selectedTool?.file)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{tool.name}</CardTitle>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                Data will be automatically imported and ready to use in the selected tool.
              </p>
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
