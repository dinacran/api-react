import React, { useState } from 'react';
import { RequestPanel } from './components/RequestPanel';
import { ResponseViewer } from './components/ResponseViewer';
import { ApiResponse, RequestConfig } from './types';
import { Terminal } from 'lucide-react';

function App() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (config: RequestConfig) => {
    setLoading(true);
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setResponse({
        status: response.status,
        headers: responseHeaders,
        data,
      });
    } catch (error) {
      setResponse({
        status: 0,
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              API Testing & Visualization
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <RequestPanel onRequest={handleRequest} />
          </div>
          <div>
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponseViewer response={response} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;