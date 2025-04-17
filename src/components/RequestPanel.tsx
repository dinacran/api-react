import React, { useState } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import { RequestConfig, AuthConfig } from '../types';

interface RequestPanelProps {
  onRequest: (config: RequestConfig) => Promise<void>;
}

interface CustomHeader {
  key: string;
  value: string;
}

export function RequestPanel({ onRequest }: RequestPanelProps) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<RequestConfig['method']>('GET');
  const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([]);
  const [contentType, setContentType] = useState('application/json');
  const [body, setBody] = useState('');
  const [auth, setAuth] = useState<AuthConfig>({ type: 'None' });

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

    // Combine custom headers with auth and content-type headers
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as RequestConfig['method'])}
            className="bg-gray-100 rounded px-3 py-2"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1 border rounded px-3 py-2"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Headers</h3>
            <button
              type="button"
              onClick={handleAddHeader}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className="flex-1 border rounded px-3 py-2"
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

        <div className="space-y-2">
          <h3 className="font-semibold">Authentication</h3>
          <select
            value={auth.type}
            onChange={(e) => setAuth({ type: e.target.value as AuthConfig['type'] })}
            className="w-full bg-gray-100 rounded px-3 py-2"
          >
            {['None', 'Basic', 'Bearer', 'JWT'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {auth.type === 'Basic' && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Username"
                value={auth.username || ''}
                onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={auth.password || ''}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
          )}

          {(auth.type === 'Bearer' || auth.type === 'JWT') && (
            <input
              type="text"
              placeholder="Token"
              value={auth.token || ''}
              onChange={(e) => setAuth({ ...auth, token: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {method !== 'GET' && (
          <div className="space-y-2">
            <h3 className="font-semibold">Request Body</h3>
            <div className="mb-2">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-gray-100 rounded px-3 py-2"
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
              className="w-full h-48 border rounded px-3 py-2 font-mono"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Send size={18} /> Send Request
        </button>
      </form>
    </div>
  );
}