'use client';

import { useState } from 'react';
import FileDropZone from '@/components/FileDropZone';
import PreviewTable from '@/components/PreviewTable';
import QAAssistant from '@/components/QAAssistant';
import QAResultsPanel from '@/components/QAResultsPanel';
import { parseMultipleWordDocuments } from '@/lib/wordParser';
import { parseExcelFile } from '@/lib/excelParser';
import { generateExcelFile } from '@/lib/excelGenerator';
import { generateWordDocument, documentToBlob } from '@/lib/wordGenerator';
import marketsData from '@/data/markets.json';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('word-to-excel');
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'complete'
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [qaResults, setQAResults] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Handle Word files upload
  const handleWordFiles = async (files) => {
    setIsProcessing(true);
    setError(null);

    try {
      const { parsed, errors } = await parseMultipleWordDocuments(files);

      if (errors.length > 0) {
        console.warn('Parsing errors:', errors);
        setError(`Failed to parse ${errors.length} file(s): ${errors.map(e => e.filename).join(', ')}`);
      }

      if (parsed.length === 0) {
        throw new Error('No files were successfully parsed');
      }

      // Merge all parsed documents into single structure
      const mergedData = mergeWordDocuments(parsed);
      setParsedData(mergedData);
      setStep('preview');

    } catch (err) {
      console.error('Error processing Word files:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Excel file upload
  const handleExcelFile = async (files) => {
    setIsProcessing(true);
    setError(null);

    try {
      const parsedExcel = await parseExcelFile(files[0]);
      setParsedData(parsedExcel);
      setStep('preview');

    } catch (err) {
      console.error('Error processing Excel file:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Excel generation from Word
  const handleGenerateExcel = () => {
    setIsProcessing(true);

    try {
      // Transform parsed Word data to Excel format
      const excelData = transformWordDataToExcel(parsedData);

      // Generate Excel file
      const excelBlob = generateExcelFile(excelData);

      // Download
      const url = URL.createObjectURL(excelBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Import_${parsedData.market}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      setStep('complete');

    } catch (err) {
      console.error('Error generating Excel:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Word generation from Excel
  const handleGenerateWord = async () => {
    setIsProcessing(true);

    try {
      const JSZip = (await import('jszip')).default;
      const fileSaver = await import('file-saver');
      const saveAs = fileSaver.default?.saveAs || fileSaver.saveAs;

      const zip = new JSZip();

      // Generate Word doc for each market
      for (const marketCode of parsedData.markets) {
        const market = marketsData.markets.find(m => m.code === marketCode) || {
          code: marketCode,
          name: marketCode,
          language: marketCode.split('-')[0]
        };

        // Build deliverable structure for this market
        const deliverable = {
          sections: Object.values(parsedData.grouped).map(section => ({
            name: section.name,
            fields: section.fields.map(field => ({
              name: field.name,
              content: field.content[marketCode] || ''
            }))
          }))
        };

        // Generate Word document
        const doc = generateWordDocument(deliverable, market);
        const blob = await documentToBlob(doc);

        // Add to ZIP
        zip.file(`Marketing_Copy_${marketCode}.docx`, blob);
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `Excel_to_Word_${Date.now()}.zip`);

      setStep('complete');

    } catch (err) {
      console.error('Error generating Word documents:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setParsedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Import & Convert
              </h1>
              <p className="mt-2 text-gray-600">
                Convert between Word and Excel formats
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Generator
            </a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('word-to-excel');
                resetFlow();
              }}
              className={`
                py-4 px-2 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'word-to-excel'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Word → Excel
            </button>
            <button
              onClick={() => {
                setActiveTab('excel-to-word');
                resetFlow();
              }}
              className={`
                py-4 px-2 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'excel-to-word'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Excel → Word
            </button>
            <button
              onClick={() => {
                setActiveTab('qa-assistant');
                resetFlow();
              }}
              className={`
                py-4 px-2 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'qa-assistant'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              QA Assistant
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                New
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-medium">Error:</span> {error}
            </p>
          </div>
        )}

        {activeTab === 'word-to-excel' && (
          <>
            {step === 'upload' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Import Word Documents
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload completed Word documents to generate a consolidated Excel template.
                    The system will automatically parse sections and fields.
                  </p>

                  <FileDropZone
                    acceptedFileTypes={['.docx']}
                    multiple={true}
                    maxFiles={20}
                    maxSizeMB={10}
                    onFilesAccepted={handleWordFiles}
                    label="Drop Word Documents Here"
                    icon={
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />

                  {isProcessing && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing documents...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'preview' && parsedData && (
              <PreviewTable
                data={parsedData}
                type={activeTab === 'word-to-excel' ? 'word' : 'excel'}
                onConfirm={activeTab === 'word-to-excel' ? handleGenerateExcel : handleGenerateWord}
                onCancel={resetFlow}
                showWarnings={true}
              />
            )}

            {step === 'complete' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Excel File Generated!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your Word documents have been successfully converted to Excel format.
                  </p>
                  <button
                    onClick={resetFlow}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Import More Documents
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'excel-to-word' && (
          <>
            {step === 'upload' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Import Excel Template
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload an Excel localization template to generate Word documents for each market.
                    The system will read the Copy Template tab and create formatted Word files.
                  </p>

                  <FileDropZone
                    acceptedFileTypes={['.xlsx']}
                    multiple={false}
                    maxFiles={1}
                    maxSizeMB={10}
                    onFilesAccepted={handleExcelFile}
                    label="Drop Excel File Here"
                    icon={
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  {isProcessing && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Excel file...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'preview' && parsedData && (
              <PreviewTable
                data={parsedData}
                type="excel"
                onConfirm={handleGenerateWord}
                onCancel={resetFlow}
                showWarnings={true}
              />
            )}

            {step === 'complete' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Word Documents Generated!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your Excel template has been successfully converted to Word documents for all markets.
                  </p>
                  <button
                    onClick={resetFlow}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Import Another File
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'qa-assistant' && (
          <>
            {!parsedData ? (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    QA Assistant
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload Word or Excel files to run AI-powered quality checks on your marketing copy.
                    Get grammar suggestions, tone analysis, and more.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <FileDropZone
                      acceptedFileTypes={['.docx']}
                      multiple={true}
                      maxFiles={20}
                      maxSizeMB={10}
                      onFilesAccepted={handleWordFiles}
                      label="Drop Word Files"
                      className="h-48"
                    />
                    <FileDropZone
                      acceptedFileTypes={['.xlsx']}
                      multiple={false}
                      maxFiles={1}
                      maxSizeMB={10}
                      onFilesAccepted={handleExcelFile}
                      label="Drop Excel File"
                      className="h-48"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Quality Assurance
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {parsedData.markets?.length || 1} market(s) • {parsedData.rows?.length || parsedData.sections?.length || 0} items
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          const response = await fetch('/api/qa', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              mode: 'batch',
                              projectData: parsedData
                            })
                          });
                          const results = await response.json();
                          setQAResults(results);
                        } catch (err) {
                          setError(err.message);
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Running QA...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Run QA Check
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {showChat ? 'Hide' : 'Chat with'} Claude
                    </button>
                    <button
                      onClick={() => {
                        setParsedData(null);
                        setQAResults(null);
                        setShowChat(false);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* QA Results */}
                {qaResults && (
                  <QAResultsPanel
                    results={qaResults}
                    onClose={() => setQAResults(null)}
                  />
                )}

                {/* Chat Assistant */}
                {showChat && (
                  <div className="h-[600px]">
                    <QAAssistant
                      projectData={parsedData}
                      onClose={() => setShowChat(false)}
                    />
                  </div>
                )}

                {/* Preview Table */}
                {!qaResults && !showChat && (
                  <PreviewTable
                    data={parsedData}
                    type={parsedData.rows ? 'excel' : 'word'}
                    onConfirm={() => {}}
                    onCancel={() => setParsedData(null)}
                    showWarnings={true}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Helper: Merge multiple Word documents
function mergeWordDocuments(parsedDocuments) {
  if (parsedDocuments.length === 1) {
    return parsedDocuments[0];
  }

  // Merge all documents - assuming same market
  const merged = {
    market: parsedDocuments[0].market,
    sections: [],
    metadata: {
      filename: `${parsedDocuments.length} documents`,
      parsedAt: new Date(),
      warnings: []
    }
  };

  parsedDocuments.forEach(doc => {
    merged.sections.push(...doc.sections);
    merged.metadata.warnings.push(...(doc.metadata.warnings || []));
  });

  return merged;
}

// Helper: Transform Word data to Excel format
function transformWordDataToExcel(wordData) {
  const deliverables = [];
  const markets = [wordData.market];

  wordData.sections.forEach(section => {
    const deliverable = {
      name: section.deliverable,
      sections: [{
        name: section.deliverable,
        fields: section.fields.map(f => f.name)
      }]
    };

    deliverables.push(deliverable);
  });

  // Create market object
  const marketObj = {
    code: wordData.market,
    name: wordData.market,
    language: wordData.market.split('-')[0]
  };

  return {
    deliverables,
    markets: [marketObj],
    projectName: `Import_${wordData.market}_${Date.now()}`
  };
}
