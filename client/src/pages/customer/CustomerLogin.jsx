import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) return setError('Please fill all required fields.');
    setBusy(true);
    try {
      const r = await api.post('/auth/customer-login', { identifier, password });
      login(r);
      toast.success(r.message);
      nav(loc.state?.from && loc.state.from !== '/login' ? loc.state.from : '/customer', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="page container">
      <form className="card form-card" onSubmit={submit} noValidate>
        <h2 style={{ marginBottom: '1.2rem' }}>Customer Login</h2>
        {error && <div className="error-text" role="alert">{error}</div>}
        <div className="field"><label htmlFor="id">Username or Email</label>
          <input id="id" className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" /></div>
        <div className="field"><label htmlFor="pw">Password</label>
          <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <div className="row">
          <button className="btn btn-gold" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setIdentifier(''); setPassword(''); setError(''); }}>Clear</button>
        </div>
        <p className="muted" style={{ marginTop: '1.2rem' }}>New here? <Link to="/register" className="gold">Create New Account</Link></p>
      </form>
    </div>
  );
}
