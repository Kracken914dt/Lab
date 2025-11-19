import { useState } from 'react';

const API_URL = 'http://localhost:3000';

function SecureFlow() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secure/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setResponse({ type: 'success', data: { message: 'Login exitoso', tokens: data } });
      } else {
        setResponse({ type: 'error', data });
      }
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secure/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setResponse({ type: res.ok ? 'success' : 'error', data });
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secure/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setResponse({ type: res.ok ? 'success' : 'error', data });
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secure/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setResponse({ type: 'success', data: { message: 'Tokens renovados', tokens: data } });
      } else {
        setResponse({ type: 'error', data });
      }
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secure/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken('');
        setRefreshToken('');
        setResponse({ type: 'success', data: { message: 'Logout exitoso' } });
      } else {
        setResponse({ type: 'error', data });
      }
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Login */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Login</h4>
        <div className="space-y-3 mb-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-green-500 outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 bg-gray-600 text-white rounded border border-gray-500 focus:border-green-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Login'}
        </button>
        {accessToken && (
          <div className="mt-3 space-y-2">
            <div className="p-2 bg-gray-800 rounded text-xs text-green-400 break-all">
              Access: {accessToken.substring(0, 50)}...
            </div>
            <div className="p-2 bg-gray-800 rounded text-xs text-blue-400 break-all">
              Refresh: {refreshToken.substring(0, 50)}...
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {accessToken && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-semibold text-white mb-3">Acciones</h4>
          <button
            onClick={handleProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            Ver Profile (verificado)
          </button>
          <button
            onClick={handleAdmin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition"
          >
            Acceder a /secure/admin
          </button>
        </div>
      )}

      {/* Token Management */}
      {refreshToken && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-semibold text-white mb-3">Gestión de Sesión</h4>
          <button
            onClick={handleRefresh}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded transition"
          >
            Renovar Tokens (Refresh)
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
          >
            Logout (invalidar tokens)
          </button>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className={`rounded-lg p-4 ${
          response.type === 'success' ? 'bg-green-900/30 border border-green-500' :
          'bg-red-900/30 border border-red-500'
        }`}>
          <h4 className="font-semibold mb-2 text-white">Respuesta:</h4>
          <pre className="text-sm text-gray-300 overflow-auto">{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SecureFlow;
