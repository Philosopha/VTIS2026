import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    border: '1px solid var(--border)', background: '#fff', color: 'var(--text)',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(11,15,46,0.25)',
      }}>
        {/* Header */}
        <p style={{ fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>
          VTIS <span style={{ color: 'var(--gold)' }}>2026</span>
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32, letterSpacing: 1, textTransform: 'uppercase' }}>
          Admin Portal
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
              Email
            </label>
            <input type="email" required value={email}
              onChange={e => setEmail(e.target.value)} style={inp}
              placeholder="admin@vtis2026.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
              Password
            </label>
            <input type="password" required value={password}
              onChange={e => setPassword(e.target.value)} style={inp}
              placeholder="••••••••" />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
              background: loading ? 'var(--surf2)' : 'var(--ink)',
              color: loading ? 'var(--muted)' : '#fff',
              fontWeight: 600, fontSize: 14, marginTop: 4,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
