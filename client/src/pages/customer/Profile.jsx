import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get(`/customers/${user.id}`).then(setP).catch((e) => toast.error(e.message)); }, [user.id]); // eslint-disable-line

  if (!p) return <div className="page container"><Spinner /></div>;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.put(`/customers/${user.id}`, { name: p.name, phone: p.phone, address: p.address });
      updateUser(r.user);
      toast.success(r.message);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword || !pw.newPassword) return toast.error('Please fill all required fields.');
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match.');
    setBusy(true);
    try {
      await api.put(`/customers/${user.id}`, { ...p, currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="page container">
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>Profile</h1></div>
      <div className="grid grid-2">
        <form className="card" onSubmit={save}>
          <h3 style={{ marginBottom: '1rem' }}>Your details</h3>
          <div className="field"><label htmlFor="pn">Name</label><input id="pn" className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="pe">Email</label><input id="pe" className="input" value={p.email} readOnly /></div>
          <div className="field"><label htmlFor="pp">Phone</label><input id="pp" className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div>
          <div className="field"><label htmlFor="pa">Address</label><textarea id="pa" className="input" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></div>
          <button className="btn btn-gold" disabled={busy}>Save profile</button>
        </form>
        <form className="card" onSubmit={changePw}>
          <h3 style={{ marginBottom: '1rem' }}>Change password</h3>
          <div className="field"><label htmlFor="cp">Current password</label><input id="cp" type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="np">New password</label><input id="np" type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="cf">Confirm new password</label><input id="cf" type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
          <button className="btn btn-ghost" disabled={busy}>Change password</button>
        </form>
      </div>
    </div>
  );
}
