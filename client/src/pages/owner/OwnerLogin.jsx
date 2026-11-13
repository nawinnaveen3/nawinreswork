import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function OwnerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) return setError('Please fill all required fields.');
    setBusy(true);
    try {
      const r = await api.post('/auth/owner-login', { username, password });
      login(r);
      toast.success(r.message);
      nav('/owner', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1rem',
      background: 'linear-gradient(rgba(13,10,8,.9), rgba(13,10,8,.9)), url(https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=60) center/cover' }}>
      <form className="glass form-card" style={{ width: 'min(440px,100%)' }} onSubmit={submit} noValidate>
        <div className="brand" style={{ marginBottom: '.4rem' }}>NAWIN'S RESTAURANT</div>
        <h2 style={{ marginBottom: '1.2rem' }}>Owner Login</h2>
        {error && <div className="error-text" role="alert">{error}</div>}
        <div className="field"><label htmlFor="ou">Username</label><input id="ou" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></div>
        <div className="field"><label htmlFor="op">Password</label><input id="op" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <div className="row">
          <button className="btn btn-gold" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setUsername(''); setPassword(''); setError(''); }}>Clear</button>
        </div>
        <p className="muted" style={{ marginTop: '1.2rem' }}><Link to="/">Back to website</Link></p>
      </form>
    </div>
  );
}
