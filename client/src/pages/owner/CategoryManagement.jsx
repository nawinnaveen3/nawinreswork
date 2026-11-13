import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

export default function CategoryManagement() {
  const [cats, setCats] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const toast = useToast();

  const load = () => api.get('/categories').then(setCats).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please fill all required fields.');
    try {
      const body = { name: form.name, description: form.description };
      const r = form.id ? await api.put(`/categories/${form.id}`, body) : await api.post('/categories', body);
      toast.success(r.message); setForm(null); await load();
    } catch (err) { toast.error(err.message); }
  };
  const remove = async () => {
    try { const r = await api.del(`/categories/${del.id}`); toast.success(r.message); setDel(null); await load(); }
    catch (err) { toast.error(err.message); }
  };

  if (error) return <div className="empty">{error}</div>;
  if (!cats) return <Spinner />;

  return (
    <>
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Categories</h1>
        <button className="btn btn-gold" onClick={() => setForm({ id: null, name: '', description: '' })}><Plus size={16} /> Add Category</button>
      </div>
      {cats.length === 0 ? <div className="empty">No categories yet. Add your own, for example Starters or Desserts.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Foods</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td><td className="muted">{c.description || '-'}</td><td>{c.item_count}</td>
                  <td><div className="row" style={{ gap: '.5rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setForm({ ...c, description: c.description || '' })}><Pencil size={14} /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDel(c)}><Trash2 size={14} /> Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {form && (
        <Modal title={form.id ? 'Edit Category' : 'Add Category'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <div className="field"><label htmlFor="cn">Name</label><input id="cn" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="cd">Description</label><input id="cd" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="row"><button className="btn btn-gold">Save</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button></div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Delete category" onClose={() => setDel(null)}>
          <p style={{ marginBottom: '1.2rem' }}>Delete <b className="gold">{del.name}</b>? Foods in this category stay on the menu without a category.</p>
          <div className="row"><button className="btn btn-danger" onClick={remove}>Delete</button><button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button></div>
        </Modal>
      )}
    </>
  );
}
