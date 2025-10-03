# Component Specifications

## 🎯 Overview
This document specifies all new React components needed for the Import & QA system (Phase 2).

---

## 📁 Component: FileDropZone

**Path:** `/components/FileDropZone.js`

### Purpose
Reusable drag-and-drop file upload component with validation and preview.

### Props
```javascript
{
  acceptedFileTypes: string[],      // e.g., ['.docx', '.xlsx']
  multiple: boolean,                 // Allow multiple files?
  maxFiles: number,                  // Max number of files (if multiple)
  maxSizeMB: number,                 // Max file size in MB
  onFilesAccepted: (files) => void,  // Callback with File[] array
  label: string,                     // Display text
  icon: ReactNode,                   // Optional icon component
  className: string                  // Additional styling
}
```

### Features
- ✅ Drag and drop area
- ✅ Click to browse
- ✅ File type validation
- ✅ File size validation
- ✅ Visual feedback (hover, dragging states)
- ✅ File preview list with remove buttons
- ✅ Error messages for invalid files
- ✅ Loading state during processing

### Implementation
```javascript
'use client';

import { useState, useRef } from 'react';

export default function FileDropZone({
  acceptedFileTypes = [],
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 10,
  onFilesAccepted,
  label = 'Drop files here',
  icon = null,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(fileExt)) {
      return `Invalid file type: ${fileExt}. Expected: ${acceptedFileTypes.join(', ')}`;
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File too large: ${sizeMB.toFixed(2)}MB. Max: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const newErrors = [];

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push({ filename: file.name, error });
      } else {
        validFiles.push(file);
      }
    });

    // Check max files
    if (!multiple && validFiles.length > 1) {
      newErrors.push({ filename: 'Multiple files', error: 'Only one file allowed' });
      return;
    }

    if (files.length + validFiles.length > maxFiles) {
      newErrors.push({ 
        filename: 'File limit', 
        error: `Maximum ${maxFiles} files allowed` 
      });
      return;
    }

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onFilesAccepted(updatedFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesAccepted(updatedFiles);
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-600 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 bg-white'
          }
        `}
      >
        {icon && <div className="mb-4">{icon}</div>}
        
        <p className="text-lg font-medium text-gray-700 mb-2">
          {label}
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          or click to browse
        </p>
        
        <p className="text-xs text-gray-400">
          Accepted: {acceptedFileTypes.join(', ')} • Max {maxSizeMB}MB
          {multiple && ` • Up to ${maxFiles} files`}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected Files ({files.length}):
          </p>
          
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-800">
                <span className="font-medium">{error.filename}:</span> {error.error}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Usage Example
```javascript
<FileDropZone
  acceptedFileTypes={['.docx']}
  multiple={true}
  maxFiles={20}
  maxSizeMB={5}
  onFilesAccepted={(files) => handleWordFiles(files)}
  label="Drop Word Documents Here"
  icon={<DocumentIcon />}
/>
```

---

## 📊 Component: PreviewTable

**Path:** `/components/PreviewTable.js`

### Purpose
Display parsed data in a table format before final conversion.

### Props
```javascript
{
  data: ParsedData,                  // From wordParser or excelParser
  type: 'word' | 'excel',            // Source type
  onEdit: (rowIndex, field, value) => void,  // Optional inline editing
  onConfirm: () => void,             // Proceed with conversion
  onCancel: () => void,              // Go back
  showWarnings: boolean              // Show warning indicators
}
```

### Features
- ✅ Tabular display of parsed data
- ✅ Market columns (scrollable if many)
- ✅ Warning indicators for low confidence matches
- ✅ Optional inline editing
- ✅ Export to CSV for review
- ✅ Collapsible sections
- ✅ Search/filter functionality

### Implementation Outline
```javascript
'use client';

import { useState } from 'react';

export default function PreviewTable({
  data,
  type,
  onEdit,
  onConfirm,
  onCancel,
  showWarnings = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  // Group data by deliverable
  const grouped = type === 'word' 
    ? groupWordData(data) 
    : data.grouped;

  // Filter by search
  const filtered = filterData(grouped, searchTerm);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Preview Parsed Data</h2>
          <p className="text-gray-600">
            Review before conversion • {data.markets?.length || 0} markets detected
          </p>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Warnings Summary */}
      {showWarnings && data.metadata?.warnings?.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            {data.metadata.warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deliverable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Field
                </th>
                {data.markets?.map(market => (
                  <th key={market} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {market}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Render rows */}
              {Object.entries(filtered).map(([deliverable, section]) => (
                <RenderSection 
                  key={deliverable}
                  deliverable={deliverable}
                  section={section}
                  markets={data.markets}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Confirm & Convert
        </button>
      </div>
    </div>
  );
}
```

---

## 🤖 Component: QAAssistant

**Path:** `/components/QAAssistant.js`

### Purpose
Interactive chat interface for asking Claude questions about copy.

### Props
```javascript
{
  projectData: ParsedData,           // Full project data for context
  onClose: () => void,               // Close chat panel
  apiEndpoint: string                // '/api/qa' route
}
```

### Features
- ✅ Chat message history
- ✅ Streaming responses from Claude
- ✅ Context-aware (Claude sees all copy)
- ✅ Quick action buttons (check grammar, compare markets, etc.)
- ✅ Copy suggestions to clipboard
- ✅ Export chat history

### Implementation Outline
```javascript
'use client';

import { useState, useRef, useEffect } from 'react';

export default function QAAssistant({
  projectData,
  onClose,
  apiEndpoint = '/api/qa'
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          projectData,
          conversationHistory: messages
        })
      });

      if (!response.ok) throw new Error('API request failed');

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
            streaming: true
          };
          return newMessages;
        });
      }

      // Mark as complete
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].streaming = false;
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    'Check grammar across all markets',
    'Compare tone between en-US and ja-JP',
    'Find inconsistent terminology',
    'Check character limits for UI'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-800">QA Assistant</h3>
          <p className="text-sm text-gray-500">Powered by Claude</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4">Ask me anything about your copy!</p>
            <div className="space-y-2">
              {quickActions.map(action => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="block w-full px-4 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
              {msg.streaming && <span className="animate-pulse">▋</span>}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about your copy..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔍 Component: QAResultsPanel

**Path:** `/components/QAResultsPanel.js`

### Purpose
Display automated QA check results with severity levels and actionable suggestions.

### Props
```javascript
{
  results: QAResults,                // From qaEngine batch check
  onFixIssue: (issue) => void,       // Apply suggested fix
  onIgnoreIssue: (issue) => void,    // Mark as false positive
  onExportReport: () => void         // Export PDF/CSV report
}
```

### Implementation: See qa-engine-guide.md for integration details

---

## 📋 Next Steps

1. Implement FileDropZone first (most reusable)
2. Build PreviewTable next (needed for both Word and Excel flows)
3. Create QAResultsPanel (standalone, can test with mock data)
4. Build QAAssistant last (requires API route)

For API integration details, see:
- `qa-engine-guide.md`
- `api-routes-guide.md`
