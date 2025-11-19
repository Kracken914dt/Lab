import { useState } from 'react';
import VulnerableFlow from './components/VulnerableFlow';
import SecureFlow from './components/SecureFlow';

function App() {
  const [activeTab, setActiveTab] = useState('vulnerable');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🔐 JWT Security Lab
            </h1>
            <p className="text-gray-300">Broken Authentication / JWT Vulnerabilities Demo</p>
          </header>

          {/* Tabs */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => setActiveTab('vulnerable')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'vulnerable'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ❌ Vulnerable Flow
            </button>
            <button
              onClick={() => setActiveTab('secure')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'secure'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✅ Secure Flow
            </button>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
            {activeTab === 'vulnerable' ? <VulnerableFlow /> : <SecureFlow />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
