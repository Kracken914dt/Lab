import { useState } from 'react';

const API_URL = 'http://localhost:3000';

function VulnerableFlow() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [forgedToken, setForgedToken] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const base64urlEncode = (obj) => {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return btoa(json)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setToken(data.token);
      setResponse({ type: 'success', data });
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResponse({ type: 'success', data });
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const handleAdmin = async (useToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin`, {
        headers: { Authorization: `Bearer ${useToken}` },
      });
      const data = await res.json();
      setResponse({ type: res.ok ? 'success' : 'error', data });
    } catch (error) {
      setResponse({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const forgeToken = () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { user: username, role: 'admin', forged: true };
    const fakeToken = `${base64urlEncode(header)}.${base64urlEncode(payload)}.fakesignature`;
    setForgedToken(fakeToken);
    setResponse({ type: 'info', data: { message: 'Token falsificado generado', token: fakeToken } });
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
            className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 outline-none"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Login'}
        </button>
        {token && (
          <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-green-400 break-all">
            Token: {token}
          </div>
        )}
      </div>

      {/* Actions */}
      {token && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-semibold text-white mb-3">Acciones</h4>
          <button
            onClick={handleProfile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition"
          >
            Ver Profile (sin verificar firma)
          </button>
          <button
            onClick={() => handleAdmin(token)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded transition"
          >
            Acceder a /admin (con token original)
          </button>
        </div>
      )}

      {/* Forge */}
      {token && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-semibold text-white mb-3">Opciones Avanzadas</h4>
          <button
            onClick={forgeToken}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
          >
            Generar Token Falsificado (role: admin)
          </button>
          {forgedToken && (
            <>
              <div className="p-2 bg-gray-800 rounded text-xs text-red-400 break-all">
                Token Falsificado: {forgedToken}
              </div>
              <button
                onClick={() => handleAdmin(forgedToken)}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded transition"
              >
                Acceder a /admin con Token Falsificado
              </button>
            </>
          )}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className={`rounded-lg p-4 ${
          response.type === 'success' ? 'bg-green-900/30 border border-green-500' :
          response.type === 'error' ? 'bg-red-900/30 border border-red-500' :
          'bg-blue-900/30 border border-blue-500'
        }`}>
          <h4 className="font-semibold mb-2 text-white">Respuesta:</h4>
          <pre className="text-sm text-gray-300 overflow-auto">{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default VulnerableFlow;
