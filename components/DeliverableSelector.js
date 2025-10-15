// components/DeliverableSelector.js
'use client';

import { useState } from 'react';

export default function DeliverableSelector({ deliverables, selected, onChange }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [infoModal, setInfoModal] = useState(null);

  // Group deliverables by category
  const groupedDeliverables = Object.entries(deliverables).reduce((acc, [key, deliverable]) => {
    const category = deliverable.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, ...deliverable });
    return acc;
  }, {});

  const toggleDeliverable = (deliverableKey) => {
    const newSelected = selected.includes(deliverableKey)
      ? selected.filter(k => k !== deliverableKey)
      : [...selected, deliverableKey];
    onChange(newSelected);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const countTotalFields = (deliverable) => {
    return deliverable.sections?.reduce((sum, section) => {
      if (section.subsections) {
        // Nested structure (Product Detail Page)
        return sum + section.subsections.reduce((subSum, subsection) =>
          subSum + (subsection.fields?.length || 0), 0
        );
      }
      // Flat structure (Display Ads, CRM, Landing Page)
      return sum + (section.fields?.length || 0);
    }, 0) || 0;
  };

  const countTotalSections = (deliverable) => {
    return deliverable.sections?.reduce((sum, section) => {
      if (section.subsections) {
        // Count subsections for nested structure
        return sum + section.subsections.length;
      }
      // Count section itself for flat structure
      return sum + 1;
    }, 0) || 0;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Product Pages': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      'Display Ads': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'CRM': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      'Landing Pages': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };
    return icons[category] || icons['Product Pages'];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Select Deliverables</h2>
        <p className="text-gray-600 mt-1">Choose the marketing materials you need to create</p>
      </div>

      {/* Category Accordions */}
      <div className="space-y-3">
        {Object.entries(groupedDeliverables).map(([category, items]) => {
          const isExpanded = expandedCategories[category];
          const selectedInCategory = items.filter(item => selected.includes(item.key)).length;
          const hasMultipleItems = items.length > 1;

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Category Header */}
              <div
                className={`
                  p-4 flex items-center justify-between cursor-pointer transition-colors
                  ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => hasMultipleItems && toggleCategory(category)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-primary-600">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{category}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {items.length} {items.length === 1 ? 'deliverable' : 'deliverable options'}
                      {selectedInCategory > 0 && (
                        <span className="ml-2 text-primary-600 font-medium">
                          · {selectedInCategory} selected
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {hasMultipleItems && (
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {/* Deliverable Items */}
              {(isExpanded || !hasMultipleItems) && (
                <div className="border-t border-gray-100">
                  {items.map((item) => {
                    const isSelected = selected.includes(item.key);
                    const fieldCount = countTotalFields(item);

                    return (
                      <div
                        key={item.key}
                        className={`
                          p-4 flex items-start gap-3 transition-colors cursor-pointer
                          ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}
                          ${hasMultipleItems ? 'ml-4' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDeliverable(item.key);
                        }}
                      >
                        {/* Checkbox */}
                        <div className={`
                          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                          ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}
                        `}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.key}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>

                              {/* Metadata */}
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {countTotalSections(item)} sections
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  {fieldCount} fields
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {item.assets?.length || 0} assets
                                </span>
                              </div>
                            </div>

                            {/* Info Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInfoModal(item);
                              }}
                              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="View details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-4 border border-gray-200">
        <span className="text-gray-700 font-medium">
          {selected.length} deliverable{selected.length !== 1 ? 's' : ''} selected
        </span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Info Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{infoModal.key}</h3>
                  <p className="text-sm text-gray-600 mt-1">{infoModal.description}</p>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Sections */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Content Sections ({countTotalSections(infoModal)})</h4>
                <div className="space-y-3">
                  {infoModal.sections?.map((section, idx) => (
                    <div key={idx}>
                      {section.subsections ? (
                        // Nested structure (Product Detail Page)
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-800 text-sm mb-2">{section.name}</div>
                          {section.subsections.map((subsection, subIdx) => (
                            <div key={subIdx} className="bg-gray-50 rounded-md p-3 ml-4">
                              <div className="font-medium text-gray-900 text-sm">{subsection.name}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Fields: {subsection.fields.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Flat structure (Display Ads, CRM, Landing Page)
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="font-medium text-gray-900 text-sm">{section.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Fields: {section.fields.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets */}
              {infoModal.assets && infoModal.assets.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Asset Requirements ({infoModal.assets.length})</h4>
                  <div className="space-y-2">
                    {infoModal.assets.map((asset, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-md p-3">
                        <div className="font-medium text-gray-900 text-sm">{asset.name}</div>
                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                          <div>Dimensions: {asset.width} × {asset.height}px</div>
                          <div>Max size: {asset.maxFileSizeMB} MB</div>
                          <div>Formats: {asset.formats.join(', ')}</div>
                          {asset.notes && <div className="text-amber-600 mt-1">Note: {asset.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setInfoModal(null)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
