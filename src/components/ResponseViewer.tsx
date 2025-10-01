import React, { useState } from 'react';
import { Table, List, AlignLeft, X, Download } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-hidden`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
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

  const renderValue = (value: any, key: string): JSX.Element | string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (Array.isArray(value) && value.some(item => typeof item === 'object')) {
      return (
        <button
          onClick={() => setNestedView({ data: value, title: `Array: ${key}` })}
          className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
        >
          [Array of Objects]
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
    
    return String(value);
  };

  const rows = Array.isArray(data) ? data : [data];
  const flattenedRows = rows.map(row => flattenObject(row));
  const columns = Array.from(
    new Set(flattenedRows.flatMap(row => Object.keys(row)))
  );

  return (
    <>
      <div className="overflow-x-auto">
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
                    className={`px-6 py-2 whitespace-nowrap text-sm font-mono ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {renderValue(row[column], column)}
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
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    const addPaths = (obj: any, path = '') => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          initialExpanded.add(currentPath);
          if (obj[key] && typeof obj[key] === 'object') {
            addPaths(obj[key], currentPath);
          }
        });
      }
    };
    addPaths(data);
    return initialExpanded;
  });

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const getValueColor = (value: any): string => {
    if (value === null) return isDark ? 'text-gray-400' : 'text-gray-500';
    if (typeof value === 'number') return isDark ? 'text-yellow-300' : 'text-yellow-600';
    if (typeof value === 'boolean') return isDark ? 'text-purple-300' : 'text-purple-600';
    if (typeof value === 'string') return isDark ? 'text-green-300' : 'text-green-600';
    return isDark ? 'text-blue-300' : 'text-blue-600';
  };

  const renderTree = (obj: any, path = ''): JSX.Element => {
    if (typeof obj !== 'object' || obj === null) {
      return <span className={getValueColor(obj)}>{JSON.stringify(obj)}</span>;
    }

    const isArray = Array.isArray(obj);
    const entries = isArray ? 
      obj.map((value, index) => [index, value]) :
      Object.entries(obj);

    return (
      <div className={`pl-4 border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {entries.map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          const isExpandable = typeof value === 'object' && value !== null;
          const isExpanded = expanded.has(currentPath);

          return (
            <div key={currentPath} className="leading-none">
              <div 
                className="flex items-center gap-1 cursor-pointer py-0.5"
                onClick={() => isExpandable && toggleExpand(currentPath)}
              >
                {isExpandable && (
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                <span className={isDark ? 'text-gray-300 font-semibold' : 'text-gray-700 font-semibold'}>
                  {key}:
                </span>
                {!isExpandable && (
                  <span className={`ml-2 ${getValueColor(value)}`}>
                    {JSON.stringify(value)}
                  </span>
                )}
              </div>
              {isExpandable && isExpanded && (
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
    <div className={`font-mono text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded overflow-x-auto`}>
      {renderTree(data)}
    </div>
  );
}

function formatJson(data: any, isDark: boolean): string {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return lines.map(line => {
    const match = line.match(/^(\s*)"(.+)":\s(.+)$/);
    if (match) {
      const [, indent, key, value] = match;
      const keyColor = isDark ? '\x1b[36m' : '\x1b[34m';
      
      // Determine value type and color without JSON.parse
      let coloredValue = value;
      if (value === 'null') {
        coloredValue = `${isDark ? '\x1b[90m' : '\x1b[90m'}${value}\x1b[0m`;
      } else if (value === 'true' || value === 'false') {
        coloredValue = `${isDark ? '\x1b[35m' : '\x1b[35m'}${value}\x1b[0m`;
      } else if (value.match(/^-?\d+(\.\d+)?$/)) {
        coloredValue = `${isDark ? '\x1b[33m' : '\x1b[33m'}${value}\x1b[0m`;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        coloredValue = `${isDark ? '\x1b[32m' : '\x1b[32m'}${value}\x1b[0m`;
      }
      
      return `${indent}${keyColor}"${key}"\x1b[0m: ${coloredValue}`;
    }
    return line;
  }).join('\n');
}

export function ResponseViewer({ response, isDark }: ResponseViewerProps) {
  const [view, setView] = useState<'tree' | 'table' | 'raw'>('tree');

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
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded ${
            response.status < 300 ? 'bg-green-100 text-green-800' :
            response.status < 400 ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            Status: {response.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('tree')}
            className={`p-2 rounded ${
              isDark
                ? view === 'tree' ? 'bg-gray-700' : 'hover:bg-gray-700'
                : view === 'tree' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Tree View"
          >
            <List size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded ${
              isDark
                ? view === 'table' ? 'bg-gray-700' : 'hover:bg-gray-700'
                : view === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Table View"
          >
            <Table size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button
            onClick={() => setView('raw')}
            className={`p-2 rounded ${
              isDark
                ? view === 'raw' ? 'bg-gray-700' : 'hover:bg-gray-700'
                : view === 'raw' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Raw View"
          >
            <AlignLeft size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button
            onClick={handleExport}
            className={`p-2 rounded ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Export Data"
          >
            <Download size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Response Headers</h3>
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="text-sm leading-none mb-1">
              <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{key}:</span>{' '}
              <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>{value}</span>
            </div>
          ))}
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
            <pre className={`${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-900'} p-4 rounded overflow-x-auto leading-none`}>
              <code style={{ whiteSpace: 'pre' }}>
                {formatJson(response.data, isDark)}
              </code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}