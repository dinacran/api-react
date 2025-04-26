import React, { useState, useRef, useEffect } from 'react';
import { Table, List, AlignLeft, X, Download, Code } from 'lucide-react';
import { ApiResponse } from '../types';
import * as XLSX from 'xlsx';

interface ResponseViewerProps {
  response: ApiResponse | null;
  isDark: boolean;
}

interface NestedTableProps {
  data: any;
  onClose: () => void;
  title: string;
  isDark: boolean;
}

function NestedTable({ data, onClose, title, isDark }: NestedTableProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating to the background
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-hidden`}
      >
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>
        <div
          className="p-4 overflow-auto max-h-[calc(80vh-4rem)] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1"
        >
          <JsonTable data={data} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

function JsonTable({ data, isDark }: { data: any; isDark: boolean }) {
  const [nestedView, setNestedView] = useState<{
    data: any;
    title: string;
  } | null>(null);
  const [expandedCell, setExpandedCell] = useState<{row: number; col: string} | null>(null);

  if (!data || typeof data !== 'object') return null;

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        acc[newKey] = value;
      } else if (Array.isArray(value) && value.some(item => typeof item === 'object')) {
        acc[newKey] = value;
      } else {
        acc[newKey] = value;
      }
      
      return acc;
    }, {});
  };

  const renderValue = (value: any, key: string, rowIndex: number): JSX.Element | string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (Array.isArray(value) && value.some(item => typeof item === 'object')) {
      return (
        <button
          onClick={() => setNestedView({ data: value, title: `Array: ${key}` })}
          className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
        >
          [...]
        </button>
      );
    }
    
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      return (
        <button
          onClick={() => setNestedView({ data: value, title: `Object: ${key}` })}
          className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
        >
          {Object.keys(value).length} properties
        </button>
      );
    }
    
    const stringValue = String(value);
    const isExpanded = expandedCell?.row === rowIndex && expandedCell?.col === key;
    
    return (
      <div 
        className={`cursor-pointer ${isExpanded ? 'whitespace-normal' : 'whitespace-nowrap overflow-hidden text-ellipsis'}`}
        onClick={() => setExpandedCell(isExpanded ? null : { row: rowIndex, col: key })}
        title={stringValue}
      >
        {stringValue}
      </div>
    );
  };

  const rows = Array.isArray(data) ? data : [data];
  const flattenedRows = rows.map(row => flattenObject(row));
  const columns = Array.from(
    new Set(flattenedRows.flatMap(row => Object.keys(row)))
  );

  return (
    <>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column}
                  className={`px-6 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {flattenedRows.map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td 
                    key={column}
                    className={`px-6 py-2 ${
                      expandedCell?.row === i && expandedCell?.col === column 
                        ? 'min-w-[500px] w-auto' 
                        : 'max-w-[300px]'
                    } text-sm font-mono ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {renderValue(row[column], column, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nestedView && (
        <NestedTable
          data={nestedView.data}
          onClose={() => setNestedView(null)}
          title={nestedView.title}
          isDark={isDark}
        />
      )}
    </>
  );
}

function TreeView({ data, isDark }: { data: any; isDark: boolean }) {
  const getValueColor = (value: any): string => {
    if (value === null) return isDark ? 'text-gray-500' : 'text-gray-500';
    if (typeof value === 'number') return isDark ? 'text-yellow-400' : 'text-yellow-600';
    if (typeof value === 'boolean') return isDark ? 'text-purple-400' : 'text-purple-600';
    if (typeof value === 'string') return isDark ? 'text-green-400' : 'text-green-600';
    return isDark ? 'text-blue-400' : 'text-blue-600';
  };

  const renderTree = (obj: any, path = ''): JSX.Element => {
    if (typeof obj !== 'object' || obj === null) {
      return (
        <div className="flex items-center">
          <span className={getValueColor(obj)}>{JSON.stringify(obj)}</span>
        </div>
      );
    }

    const isArray = Array.isArray(obj);
    const entries = isArray ? 
      obj.map((value, index) => [index, value]) :
      Object.entries(obj);

    return (
      <div className="pl-4 border-l border-gray-600">
        {entries.map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          const isExpandable = typeof value === 'object' && value !== null;

          return (
            <div key={currentPath} className="leading-none">
              <div className="flex items-center gap-1 py-0.5">
                {isExpandable && (
                  <span className={isDark ? 'text-gray-400' : 'text-gray-400'}>▼</span>
                )}
                <span className={isDark ? 'text-gray-200 font-semibold' : 'text-gray-700 font-semibold'}>
                  {key}:
                </span>
                {!isExpandable && (
                  <span className={`ml-2 ${getValueColor(value)}`}>
                    {JSON.stringify(value)}
                  </span>
                )}
              </div>
              {isExpandable && (
                <div className="ml-4">
                  {renderTree(value, currentPath)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`font-mono text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded overflow-x-auto`}>
      {renderTree(data)}
    </div>
  );
}

// Revert formatJson to its original implementation
const formatJson = (data: any, isDark: boolean): { html: string; lineCount: number } => {
  if (!data) return { html: '', lineCount: 0 };
  
  const jsonString = JSON.stringify(data, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-gray-500';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = isDark ? 'text-blue-400' : 'text-blue-600';
        } else {
          cls = isDark ? 'text-green-400' : 'text-green-600';
        }
      } else if (/true|false/.test(match)) {
        cls = isDark ? 'text-purple-400' : 'text-purple-600';
      } else if (/null/.test(match)) {
        cls = isDark ? 'text-gray-500' : 'text-gray-500';
      } else if (!isNaN(Number(match))) {
        cls = isDark ? 'text-yellow-400' : 'text-yellow-600';
      }
      return `<span class="${cls}">${match}</span>`;
    });

  const lines = jsonString.split('\n');
  const lineCount = lines.length;
  const html = lines.map(line => `<div>${line}</div>`).join('');

  return { html, lineCount };
};

function HtmlView({ content, isDark }: { content: string; isDark: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        
        // Add theme-specific styles
        const themeStyles = `
          <style>
            body {
              background-color: ${isDark ? '#1f2937' : '#ffffff'};
              color: ${isDark ? '#e5e7eb' : '#111827'};
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 1rem;
            }
            a {
              color: ${isDark ? '#60a5fa' : '#2563eb'};
            }
            a:visited {
              color: ${isDark ? '#a78bfa' : '#7c3aed'};
            }
            h1, h2, h3, h4, h5, h6 {
              color: ${isDark ? '#f3f4f6' : '#1f2937'};
            }
            code, pre {
              background-color: ${isDark ? '#374151' : '#f3f4f6'};
              color: ${isDark ? '#e5e7eb' : '#111827'};
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
            }
            pre {
              padding: 1rem;
              overflow-x: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
              padding: 0.5rem;
            }
            th {
              background-color: ${isDark ? '#374151' : '#f3f4f6'};
            }
            tr:nth-child(even) {
              background-color: ${isDark ? '#374151' : '#f9fafb'};
            }
            blockquote {
              border-left: 4px solid ${isDark ? '#4b5563' : '#d1d5db'};
              margin: 0;
              padding-left: 1rem;
              color: ${isDark ? '#9ca3af' : '#6b7280'};
            }
          </style>
        `;
        
        // Add the content with theme styles
        doc.write(themeStyles + content);
        doc.close();
      }
    }
  }, [content, isDark]);

  return (
    <div className={`w-full h-[600px] ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden`}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts"
        title="HTML Response"
      />
    </div>
  );
}

export function ResponseViewer({ response, isDark }: ResponseViewerProps) {
  const [view, setView] = useState<'tree' | 'table' | 'raw' | 'html'>('tree');
  const isHtml = response?.headers['content-type']?.includes('text/html');

  // Remove memoization of formatted JSON
  const formattedJson = response?.data ? formatJson(response.data, isDark) : { html: '', lineCount: 0 };

  useEffect(() => {
    if (isHtml) {
      setView('html');
    }
  }, [isHtml]);

  const handleExport = () => {
    if (!response?.data) return;

    if (view === 'table') {
      // Export as Excel
      const ws = XLSX.utils.json_to_sheet([response.data].flat());
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Response Data');
      XLSX.writeFile(wb, 'response-data.xlsx');
    } else {
      // Export as JSON
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!response) return null;

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Response Headers</h3>
          <div className="p-2">
            <div className="text-sm leading-none mb-1">
              <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Status:</span>{' '}
              <span className={`${
                response.status < 300 ? 'text-green-600' :
                response.status < 400 ? 'text-blue-600' :
                'text-red-600'
              }`}>{response.status}</span>
            </div>
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="text-sm leading-none mb-1">
                <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{key}:</span>{' '}
                <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`flex gap-2 ml-4 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          {!isHtml && (
            <>
          <button
            onClick={() => setView('tree')}
                className={`p-1.5 rounded ${
              isDark
                    ? view === 'tree' ? 'bg-gray-600' : 'hover:bg-gray-600'
                : view === 'tree' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Tree View"
          >
            <List size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button
            onClick={() => setView('table')}
                className={`p-1.5 rounded ${
              isDark
                    ? view === 'table' ? 'bg-gray-600' : 'hover:bg-gray-600'
                : view === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Table View"
          >
            <Table size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
            </>
          )}
          <button
            onClick={() => setView(isHtml ? 'html' : 'raw')}
            className={`p-1.5 rounded ${
              isDark
                ? (isHtml ? view === 'html' : view === 'raw') ? 'bg-gray-600' : 'hover:bg-gray-600'
                : (isHtml ? view === 'html' : view === 'raw') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title={isHtml ? "HTML View" : "Raw View"}
          >
            {isHtml ? (
              <Code size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            ) : (
            <AlignLeft size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            )}
          </button>
          <button
            onClick={handleExport}
            className={`p-1.5 rounded ${
              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            }`}
            title="Export Data"
          >
            <Download size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {response.error ? (
        <div className="text-red-600 p-4 bg-red-50 rounded">
          {response.error}
        </div>
      ) : (
        <div className="mt-4">
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Response Body</h3>
          {view === 'tree' && <TreeView data={response.data} isDark={isDark} />}
          {view === 'table' && <JsonTable data={response.data} isDark={isDark} />}
          {view === 'raw' && (
            <div className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-900'} p-4 rounded overflow-x-auto leading-relaxed font-mono text-xs`}>
              <div className="flex">
                <div className="pr-4 select-none">
                  {Array.from({ length: formattedJson.lineCount }, (_, i) => (
                    <div key={i} className="text-gray-500">{i + 1}</div>
                  ))}
                </div>
                <div className="whitespace-pre">
                  <code dangerouslySetInnerHTML={{ __html: formattedJson.html }} />
                </div>
              </div>
            </div>
          )}
          {view === 'html' && typeof response.data === 'string' && (
            <HtmlView content={response.data} isDark={isDark} />
          )}
        </div>
      )}
    </div>
  );
}