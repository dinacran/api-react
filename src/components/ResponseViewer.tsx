import React, { useState } from 'react';
import { Table, List, AlignLeft, X } from 'lucide-react';
import { ApiResponse } from '../types';

interface ResponseViewerProps {
  response: ApiResponse | null;
}

interface NestedTableProps {
  data: any;
  onClose: () => void;
  title: string;
}

function NestedTable({ data, onClose, title }: NestedTableProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
          <JsonTable data={data} />
        </div>
      </div>
    </div>
  );
}

function JsonTable({ data }: { data: any }) {
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
        // Instead of flattening, keep the object reference
        acc[newKey] = value;
      } else if (Array.isArray(value) && value.some(item => typeof item === 'object')) {
        // Keep array of objects as is
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
          className="text-blue-600 hover:underline"
        >
          [..]
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
          className="text-blue-600 hover:underline"
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column}
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flattenedRows.map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td 
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono"
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
        />
      )}
    </>
  );
}

function TreeView({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderTree = (obj: any, path = ''): JSX.Element => {
    if (typeof obj !== 'object' || obj === null) {
      return <span className="text-blue-600">{JSON.stringify(obj)}</span>;
    }

    const isArray = Array.isArray(obj);
    const entries = isArray ? 
      obj.map((value, index) => [index, value]) :
      Object.entries(obj);

    return (
      <div className="pl-4 border-l border-gray-200">
        {entries.map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          const isExpandable = typeof value === 'object' && value !== null;
          const isExpanded = expanded.has(currentPath);

          return (
            <div key={currentPath} className="my-1">
              <div 
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => isExpandable && toggleExpand(currentPath)}
              >
                {isExpandable && (
                  <span className="text-gray-400 select-none">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                <span className="text-gray-700 font-semibold">
                  {key}:
                </span>
                {!isExpandable && (
                  <span className="text-blue-600 ml-2">
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
    <div className="font-mono text-sm bg-gray-50 p-4 rounded">
      {renderTree(data)}
    </div>
  );
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [view, setView] = useState<'tree' | 'table' | 'raw'>('tree');

  if (!response) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
            className={`p-2 rounded ${view === 'tree' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Tree View"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded ${view === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Table View"
          >
            <Table size={18} />
          </button>
          <button
            onClick={() => setView('raw')}
            className={`p-2 rounded ${view === 'raw' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Raw View"
          >
            <AlignLeft size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Response Headers</h3>
        <div className="bg-gray-50 p-4 rounded">
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-semibold">{key}:</span> {value}
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
          <h3 className="font-semibold mb-2">Response Body</h3>
          {view === 'tree' && <TreeView data={response.data} />}
          {view === 'table' && <JsonTable data={response.data} />}
          {view === 'raw' && (
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
