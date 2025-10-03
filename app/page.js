// app/page.js
'use client';

import { useState } from 'react';
import DeliverableSelector from '@/components/DeliverableSelector';
import MarketSelector from '@/components/MarketSelector';
import deliverablesData from '@/data/deliverables.json';
import marketsData from '@/data/markets.json';

export default function Home() {
  const [step, setStep] = useState(1);
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState(['en-US']);
  const [projectName, setProjectName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canProceed = () => {
    if (step === 1) return projectName.trim().length > 0;
    if (step === 2) return selectedDeliverables.length > 0;
    if (step === 3) return selectedMarkets.length > 0;
    return false;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import the generators
      const { generateExcelFile } = await import('@/lib/excelGenerator');
      const { generateWordDocument, documentToBlob } = await import('@/lib/wordGenerator');
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      
      // Prepare deliverable objects
      const deliverables = selectedDeliverables.map(key => ({
        name: key,
        ...deliverablesData[key]
      }));
      
      // Prepare market objects
      const markets = selectedMarkets.map(code => 
        marketsData.markets.find(m => m.code === code)
      );
      
      // Generate Excel file
      const excelBlob = generateExcelFile({
        deliverables,
        markets,
        projectName
      });
      
      // Generate Word documents for each market
      const wordDocs = await Promise.all(
        markets.map(async (market) => {
          // For each market, create a doc with all selected deliverables
          const combinedDeliverable = {
            sections: deliverables.flatMap(d => d.sections)
          };
          
          const doc = generateWordDocument(combinedDeliverable, market);
          const blob = await documentToBlob(doc);
          return {
            filename: `Marketing_Copy_${market.code}.docx`,
            blob
          };
        })
      );
      
      // Create ZIP file
      const zip = new JSZip();
      
      // Add Excel file
      zip.file(`${projectName}_Localization_Template.xlsx`, excelBlob);
      
      // Add Word documents in a subfolder
      const wordFolder = zip.folder('Word_Documents');
      wordDocs.forEach(({ filename, blob }) => {
        wordFolder.file(filename, blob);
      });
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${projectName}_Marketing_Templates.zip`);
      
    } catch (error) {
      console.error('Error generating files:', error);
      alert('Error generating files. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Marketing Template Generator
          </h1>
          <p className="mt-2 text-gray-600">
            Create localized marketing templates for global retail campaigns
          </p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Project Name' },
              { num: 2, label: 'Deliverables' },
              { num: 3, label: 'Markets' },
              { num: 4, label: 'Generate' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${step >= s.num 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {s.num}
                  </div>
                  <span className={`
                    ml-3 text-sm font-medium
                    ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {s.label}
                  </span>
                </div>
                
                {idx < 3 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Name</h2>
            <p className="text-gray-600 mb-6">
              Give your project a name. This will be used in the generated filenames.
            </p>
            
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Q4_2025_Product_Launch"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            
            <p className="mt-2 text-sm text-gray-500">
              Use underscores instead of spaces for better compatibility
            </p>
          </div>
        )}

        {step === 2 && (
          <DeliverableSelector
            deliverables={deliverablesData}
            selected={selectedDeliverables}
            onChange={setSelectedDeliverables}
          />
        )}

        {step === 3 && (
          <MarketSelector
            markets={marketsData.markets}
            selected={selectedMarkets}
            onChange={setSelectedMarkets}
          />
        )}

        {step === 4 && (
          <div className="bg-white rounded-lg shadow p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review & Generate</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Name</h3>
                <p className="text-gray-600">{projectName}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Selected Deliverables ({selectedDeliverables.length})
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {selectedDeliverables.map(key => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Selected Markets ({selectedMarkets.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMarkets.map(code => {
                    const market = marketsData.markets.find(m => m.code === code);
                    return (
                      <span key={code} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {market?.name || code}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">What You&apos;ll Receive</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Excel file with Copy Template and Asset Requirements tabs</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Word documents for each market (for copywriters)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Everything packaged in a single ZIP file</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between max-w-7xl">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                ${canProceed()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
                ${isGenerating
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generate Templates
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
