'use client';

import { useState } from 'react';

export default function QAResultsPanel({
  results,
  onClose
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'error' | 'warning' | 'suggestion'

  if (!results || !results.issues) {
    return null;
  }

  const filteredIssues = filter === 'all'
    ? results.issues
    : results.issues.filter(issue => issue.severity === filter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'suggestion':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">QA Results</h3>
          <p className="text-sm text-gray-500 mt-1">
            Found {results.summary.totalIssues} issue{results.summary.totalIssues !== 1 ? 's' : ''}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Errors</p>
              <p className="text-2xl font-bold text-red-800">{results.summary.errors}</p>
            </div>
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Warnings</p>
              <p className="text-2xl font-bold text-yellow-800">{results.summary.warnings}</p>
            </div>
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Suggestions</p>
              <p className="text-2xl font-bold text-blue-800">{results.summary.suggestions}</p>
            </div>
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({results.summary.totalIssues})
        </button>
        <button
          onClick={() => setFilter('error')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Errors ({results.summary.errors})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Warnings ({results.summary.warnings})
        </button>
        <button
          onClick={() => setFilter('suggestion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'suggestion'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Suggestions ({results.summary.suggestions})
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {filter !== 'all' ? filter + 's' : 'issues'} found
          </div>
        ) : (
          filteredIssues.map((issue, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase">
                      {issue.severity}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">
                      {issue.deliverable} - {issue.field}
                    </span>
                    {issue.market && (
                      <>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs font-medium text-gray-700">
                          {issue.market}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm mb-2">{issue.message}</p>
                  {issue.suggestion && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border border-current border-opacity-20">
                      <p className="text-xs font-medium mb-1">Suggested fix:</p>
                      <p className="text-sm">{issue.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
