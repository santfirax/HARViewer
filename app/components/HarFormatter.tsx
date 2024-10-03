'use client';

import React, { useState, useCallback } from 'react';

const HarFormatter: React.FC = () => {
  const [harInput, setHarInput] = useState<string>('');
  const [formattedOutput, setFormattedOutput] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHarInput(e.target.value);
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setHarInput(content);
        setError('');
      }
    };
    reader.readAsText(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  }, []);

  const formatJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return jsonString; // Return original string if parsing fails
    }
  };

  const formatHar = () => {
    try {
      const harData = JSON.parse(harInput);
      const formatted = harData.log.entries.map((entry: any) => ({
        url: entry.request.url,
        method: entry.request.method,
        status: entry.response.status,
        statusText: entry.response.statusText,
        startTime: new Date(entry.startedDateTime).toLocaleString(),
        time: entry.time,
        request: {
          headers: entry.request.headers,
          queryString: entry.request.queryString,
          postData: entry.request.postData,
        },
        response: {
          headers: entry.response.headers,
          content: {
            ...entry.response.content,
            text: formatJson(entry.response.content.text || ''),
          },
        },
      }));
      setFormattedOutput(formatted);
    } catch (err) {
      setError('Invalid HAR format. Please check your input.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HAR File Formatter</h1>
      <div 
        className={`mb-4 border-2 border-dashed p-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          className="w-full h-64 p-2 border rounded"
          value={harInput}
          onChange={handleInputChange}
          placeholder="Paste your HAR content here or drag and drop a HAR file..."
        />
        <p className="text-center mt-2">
          {isDragging ? 'Drop the file here' : 'Drag and drop a HAR file here or use the button below'}
        </p>
      </div>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".har"
          className="mb-2"
        />
        <button
          onClick={formatHar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Format HAR
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {formattedOutput.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Formatted Output:</h2>
          {formattedOutput.map((entry: any, index: number) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <h3 className="font-bold">{entry.method} {entry.url}</h3>
              <p>Status: {entry.status} {entry.statusText}</p>
              <p>Start Time: {entry.startTime}</p>
              <p>Duration: {entry.time}ms</p>
              
              <h4 className="font-semibold mt-2">Request Headers:</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify(entry.request.headers, null, 2)}
              </pre>

              <h4 className="font-semibold mt-2">Response Headers:</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify(entry.response.headers, null, 2)}
              </pre>

              <h4 className="font-semibold mt-2">Response Content:</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
                {entry.response.content.text}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HarFormatter;