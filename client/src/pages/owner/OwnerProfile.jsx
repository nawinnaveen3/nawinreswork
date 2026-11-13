import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function OwnerProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => { api.get(`/customers/${user.id}`).then(setP).catch((e) => toast.error(e.message)); }, [user.id]); // eslint-disable-line
  if (!p) return <Spinner />;

  const save = async (e) => {
    e.preventDefault();
    try {
      const r = await api.put(`/customers/${user.id}`, { name: p.name, phone: p.phone, address: p.address });
      updateUser(r.user); toast.success(r.message);
    } catch (err) { toast.error(err.message); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword || !pw.newPassword) return toast.error('Please fill all required fields.');
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match.');
    try {
      await api.put(`/customers/${user.id}`, { ...p, currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully.'); setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Owner Profile</h1></div>
      <div className="grid grid-2">
        <form className="card" onSubmit={save}>
          <div className="field"><label htmlFor="n">Name</label><input id="n" className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="u">Username</label><input id="u" className="input" value={p.username} readOnly /></div>
          <div className="field"><label htmlFor="e">Email</label><input id="e" className="input" value={p.email} readOnly /></div>
          <div className="field"><label htmlFor="ph">Phone</label><input id="ph" className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div>
          <div className="field"><label htmlFor="ad">Address</label><input id="ad" className="input" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></div>
          <button className="btn btn-gold">Save profile</button>
        </form>
        <form className="card" onSubmit={changePw}>
          <h3 style={{ marginBottom: '1rem' }}>Change password</h3>
          <div className="field"><label htmlFor="c1">Current password</label><input id="c1" type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="c2">New password</label><input id="c2" type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="c3">Confirm new password</label><input id="c3" type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
          <button className="btn btn-ghost">Change password</button>
        </form>
      </div>
    </>
  );
}
