import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const empty = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/contact', f);
      toast.success(r.message);
      setF(empty);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const info = [
    [MapPin, 'Address', '4-ALLAH STREET,BAHDOOR','Dubai'],
    [Phone, 'Phone', '+9025894289'],
    [Mail, 'Email', 'nawinsres100@gmail.com'],
    [Clock, 'Opening hours', 'Daily, 11:00 AM - 11:00 PM'],
  ];

  return (
    <div className="page container">
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>Nawin's Restaurant</h1><p>We would love to hear from you.</p></div>
      <div className="grid grid-2">
        <div className="card">
          {info.map(([Icon, label, text]) => (
            <div key={label} className="row" style={{ marginBottom: '1.1rem', alignItems: 'flex-start' }}>
              <Icon size={20} color="var(--gold)" />
              <div><b>{label}</b><div className="muted">{text}</div></div>
            </div>
          ))}
          <div className="empty" style={{ marginTop: '1rem' }}>Map placeholder</div>
        </div>
      <form className="card" onSubmit={submit}>
          <div className="field"><label htmlFor="cn">Home</label><input id="cn" className="input" value={f.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="ce">Email</label><input id="ce" type="email" className="input" value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="cp">Phone</label><input id="cp" className="input" value={f.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="cm">Review</label><textarea id="cm" className="input" value={f.message} onChange={set('message')} /></div>
          <button className="btn btn-gold" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
        </form>
      </div>
    </div>
  );
}
