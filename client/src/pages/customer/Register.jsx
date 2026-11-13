import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const FIELDS = [
  ['name', 'Full Name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone', 'tel', 'tel'],
  ['address', 'Address', 'text', 'street-address'], ['username', 'Username', 'text', 'username'],
  ['password', 'Password', 'password', 'new-password'], ['confirmPassword', 'Confirm Password', 'password', 'new-password'],
];

export default function Register() {
  const [f, setF] = useState(Object.fromEntries(FIELDS.map(([k]) => [k, ''])));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (FIELDS.some(([k]) => !f[k].trim())) return setError('Please fill all required fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) return setError('Please enter a valid email address.');
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
      return setError('Password must be at least 8 characters and include a letter and a number.');
    if (f.password !== f.confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const r = await api.post('/auth/register', f);
      toast.success(r.message);
      nav('/login');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="page container">
      <form className="card form-card wide" onSubmit={submit} noValidate>
        <h2 style={{ marginBottom: '1.2rem' }}>Create your account</h2>
        {error && <div className="error-text" role="alert">{error}</div>}
        <div className="two-col">
          {FIELDS.map(([k, label, type, ac]) => (
            <div className="field" key={k} style={k === 'address' ? { gridColumn: '1 / -1' } : undefined}>
              <label htmlFor={k}>{label}</label>
              <input id={k} type={type} autoComplete={ac} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <button className="btn btn-gold" disabled={busy}>{busy ? 'Creating...' : 'Create Account'}</button>
        <p className="muted" style={{ marginTop: '1.2rem' }}>Already registered? <Link to="/login" className="gold">Login</Link></p>
      </form>
    </div>
  );
}
