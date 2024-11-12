import { useState } from 'react';
import { Brain, Wrench, Terminal, Settings } from 'lucide-react';
import { XAIClient, createSystemMessage } from './lib/xai';
import { XAI_CONFIG } from './lib/config';

function App() {
  const [messages, setMessages] = useState([createSystemMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const client = new XAIClient(apiKey);
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await client.chat(newMessages, content => {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content }
        ]);
      });

      if (!response) return;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-3 rounded-lg ${activeTab === 'chat' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Brain className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`p-3 rounded-lg ${activeTab === 'tools' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Wrench className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`p-3 rounded-lg ${activeTab === 'terminal' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Terminal className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-lg ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Settings className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Settings Panel */}
        {activeTab === 'settings' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter your xAI API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={XAI_CONFIG.defaultModel}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-blue-50 ml-4'
                      : msg.role === 'user'
                      ? 'bg-green-50 mr-4'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}
                  </p>
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={loading || !apiKey}
                />
                <button
                  type="submit"
                  disabled={loading || !apiKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;