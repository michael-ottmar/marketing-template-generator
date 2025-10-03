// components/DeliverableSelector.js
'use client';

export default function DeliverableSelector({ deliverables, selected, onChange }) {
  const toggleDeliverable = (deliverableKey) => {
    const newSelected = selected.includes(deliverableKey)
      ? selected.filter(k => k !== deliverableKey)
      : [...selected, deliverableKey];
    onChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Select Deliverables</h2>
      <p className="text-gray-600">Choose the marketing materials you need to create</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(deliverables).map(([key, deliverable]) => {
          const isSelected = selected.includes(key);
          
          return (
            <div
              key={key}
              onClick={() => toggleDeliverable(key)}
              className={`
                p-6 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-primary-600 bg-primary-50 shadow-md' 
                  : 'border-gray-200 hover:border-primary-300 bg-white'
                }
              `}
            >
              <div className="flex items-start">
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mr-4
                  ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{key}</h3>
                  <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                  
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {deliverable.sections?.length || 0} sections
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {deliverable.assets?.length || 0} assets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
