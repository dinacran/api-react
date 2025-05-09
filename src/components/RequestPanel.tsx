import React, { useState } from 'react';
import { Send, Plus, Trash2, History } from 'lucide-react';
import { RequestConfig, AuthConfig } from '../types';

interface RequestPanelProps {
  onRequest: (config: RequestConfig) => Promise<void>;
  isDark: boolean;
  urlHistory: string[];
}

interface CustomHeader {
  key: string;
  value: string;
}

export function RequestPanel({ onRequest, isDark, urlHistory }: RequestPanelProps) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<RequestConfig['method']>('GET');
  const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([]);
  const [contentType, setContentType] = useState('application/json');
  const [body, setBody] = useState('');
  const [auth, setAuth] = useState<AuthConfig>({ type: 'None' });
  const [showHistory, setShowHistory] = useState(false);

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...customHeaders];
    newHeaders[index][field] = value;
    setCustomHeaders(newHeaders);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const headers: Record<string, string> = {
      ...customHeaders.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
      ...(method !== 'GET' && body && { 'Content-Type': contentType }),
      ...(auth.type === 'Basic' && {
        'Authorization': `Basic ${btoa(`${auth.username}:${auth.password}`)}`
      }),
      ...(auth.type === 'Bearer' && {
        'Authorization': `Bearer ${auth.token}`
      }),
      ...(auth.type === 'JWT' && {
        'Authorization': `JWT ${auth.token}`
      })
    };

    const config: RequestConfig = {
      url,
      method,
      headers,
      body: method !== 'GET' ? body : undefined
    };

    onRequest(config);
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as RequestConfig['method'])}
              className={`${
                isDark 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-100 text-gray-900 border-gray-300'
              } rounded px-3 py-2 border w-28`}
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter request URL"
                className={`w-full rounded px-3 py-2 border ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                    : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                }`}
                required
              />
              {urlHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${
                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <History size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              )}
              {showHistory && (
                <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                  isDark ? 'bg-gray-700' : 'bg-white'
                } border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="py-1 max-h-60 overflow-auto">
                    {urlHistory.map((historyUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setUrl(historyUrl);
                          setShowHistory(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          isDark
                            ? 'text-gray-200 hover:bg-gray-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {historyUrl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <select
              value={auth.type}
              onChange={(e) => setAuth({ type: e.target.value as AuthConfig['type'] })}
              className={`w-36 rounded px-3 py-2 border ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-100 text-gray-900 border-gray-300'
              }`}
            >
              {['None', 'Basic', 'Bearer', 'JWT'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button
              type="submit"
              className={`rounded px-6 py-2 flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send size={18} /> Send
            </button>
          </div>

          {auth.type === 'Basic' && (
            <div className="flex gap-2">
              <div className="w-28"></div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={auth.username || ''}
                  onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                  className={`rounded px-3 py-2 border ${
                    isDark
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  }`}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={auth.password || ''}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  className={`rounded px-3 py-2 border ${
                    isDark
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          )}

          {(auth.type === 'Bearer' || auth.type === 'JWT') && (
            <div className="flex gap-2">
              <div className="w-28"></div>
              <input
                type="text"
                placeholder="Token"
                value={auth.token || ''}
                onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                className={`flex-1 rounded px-3 py-2 border ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                    : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                }`}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Headers</h3>
            <button
              type="button"
              onClick={handleAddHeader}
              className={`${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              } flex items-center gap-1`}
            >
              <Plus size={16} /> Add Header
            </button>
          </div>
          <div className="space-y-2">
            {customHeaders.map((header, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className={`flex-1 rounded px-3 py-2 border ${
                    isDark
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className={`flex-1 rounded px-3 py-2 border ${
                    isDark
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(index)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {method !== 'GET' && (
          <div className="space-y-2">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Request Body</h3>
            <div className="mb-2">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className={`w-full rounded px-3 py-2 border ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                }`}
              >
                <option value="application/json">application/json</option>
                <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                <option value="text/plain">text/plain</option>
                <option value="application/xml">application/xml</option>
              </select>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={contentType === 'application/json' ? '{\n  "key": "value"\n}' : 'Enter request body'}
              className={`w-full h-48 rounded px-3 py-2 border font-mono ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
              }`}
            />
          </div>
        )}
      </form>
    </div>
  );
}