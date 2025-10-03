'use client';

import { useState } from 'react';

export default function PreviewTable({
  data,
  type,
  onConfirm,
  onCancel,
  showWarnings = true
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group data by deliverable for Word type
  const grouped = type === 'word' ? groupWordData(data) : data.grouped || {};

  // Filter by search
  const filtered = filterData(grouped, searchTerm);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Preview Parsed Data</h2>
          <p className="text-gray-600">
            Review before conversion • {data.markets?.length || 1} market{(data.markets?.length || 1) > 1 ? 's' : ''} detected
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Deliverable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10">
                  Field
                </th>
                {type === 'word' ? (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {data.market || 'Content'}
                  </th>
                ) : (
                  data.markets?.map(market => (
                    <th key={market} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {market}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(filtered).map(([deliverable, section]) => (
                <RenderSection
                  key={deliverable}
                  deliverable={deliverable}
                  section={section}
                  type={type}
                  market={data.market}
                  markets={data.markets}
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
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Confirm & Convert
        </button>
      </div>
    </div>
  );
}

// Helper: Group Word data by deliverable
function groupWordData(data) {
  if (!data.sections) return {};

  const grouped = {};

  data.sections.forEach(section => {
    grouped[section.deliverable] = {
      name: section.deliverable,
      fields: section.fields
    };
  });

  return grouped;
}

// Helper: Filter data by search term
function filterData(grouped, searchTerm) {
  if (!searchTerm.trim()) return grouped;

  const filtered = {};
  const term = searchTerm.toLowerCase();

  Object.entries(grouped).forEach(([deliverable, section]) => {
    // Check if deliverable name matches
    if (deliverable.toLowerCase().includes(term)) {
      filtered[deliverable] = section;
      return;
    }

    // Check if any field name or content matches
    const matchingFields = section.fields?.filter(field => {
      return (
        field.name?.toLowerCase().includes(term) ||
        field.content?.toLowerCase().includes(term) ||
        Object.values(field.content || {}).some(content =>
          String(content).toLowerCase().includes(term)
        )
      );
    });

    if (matchingFields && matchingFields.length > 0) {
      filtered[deliverable] = {
        ...section,
        fields: matchingFields
      };
    }
  });

  return filtered;
}

// Component to render a section's rows
function RenderSection({ deliverable, section, type, market, markets }) {
  if (!section.fields || section.fields.length === 0) {
    return (
      <tr>
        <td colSpan={type === 'word' ? 3 : (markets?.length || 0) + 2} className="px-6 py-4 text-sm text-gray-500 italic">
          No fields found for {deliverable}
        </td>
      </tr>
    );
  }

  return (
    <>
      {section.fields.map((field, fieldIndex) => (
        <tr key={`${deliverable}-${fieldIndex}`} className="hover:bg-gray-50">
          {fieldIndex === 0 && (
            <td
              rowSpan={section.fields.length}
              className="px-6 py-4 text-sm font-medium text-gray-900 align-top sticky left-0 bg-white border-r"
            >
              {deliverable}
            </td>
          )}
          <td className="px-6 py-4 text-sm text-gray-700 sticky left-32 bg-white border-r">
            {field.originalName && (
              <span className="inline-flex items-center gap-1 mb-1">
                <span className="text-xs text-yellow-600">
                  {field.originalName} →
                </span>
              </span>
            )}
            <div className="flex items-center gap-2">
              {field.name}
              {field.confidence < 1 && (
                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                  {Math.round(field.confidence * 100)}%
                </span>
              )}
            </div>
          </td>

          {type === 'word' ? (
            <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
              {field.content}
            </td>
          ) : (
            markets?.map(marketCode => (
              <td key={marketCode} className="px-6 py-4 text-sm text-gray-600 max-w-md">
                {field.content?.[marketCode] || '-'}
              </td>
            ))
          )}
        </tr>
      ))}
    </>
  );
}
