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
