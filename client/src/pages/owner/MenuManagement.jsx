import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import FoodImage from '../../components/FoodImage';

const blank = { id: null, name: '', description: '', price: '', category_id: '', image: '', availability: true };

export default function MenuManagement() {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const { money } = useCart();
  const toast = useToast();

  const load = () => Promise.all([api.get('/menu'), api.get('/categories')])
    .then(([m, c]) => { setItems(m); setCats(c); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const open = (item) => { setFile(null); setForm(item ? { ...item, category_id: item.category_id ?? '', price: String(item.price), description: item.description || '', image: item.image || '' } : blank); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '') return toast.error('Please fill all required fields.');
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('category_id', form.category_id);
    fd.append('availability', form.availability);
    if (file) fd.append('image', file); else fd.append('image', form.image);
    setBusy(true);
    try {
      const r = form.id ? await api.putForm(`/menu/${form.id}`, fd) : await api.postForm('/menu', fd);
      toast.success(r.message);
      setForm(null);
      await load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    try { const r = await api.del(`/menu/${del.id}`); toast.success(r.message); setDel(null); await load(); }
    catch (err) { toast.error(err.message); }
  };

  const toggle = async (item) => {
    const fd = new FormData();
    fd.append('name', item.name); fd.append('description', item.description || ''); fd.append('price', item.price);
    fd.append('category_id', item.category_id ?? ''); fd.append('availability', !item.availability);
    try { await api.putForm(`/menu/${item.id}`, fd); toast.success('Food item updated successfully.'); await load(); }
    catch (err) { toast.error(err.message); }
  };

  if (error) return <div className="empty">{error}</div>;
  if (!items) return <Spinner />;

  return (
    <>
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Menu Management</h1>
        <button className="btn btn-gold" onClick={() => open(null)}><Plus size={16} /> Add Food</button>
      </div>

      {items.length === 0 ? <div className="empty">No menu items yet. Click "Add Food" to create your first one.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><FoodImage src={i.image} name={i.name} className="thumb" /></td>
                  <td><b>{i.name}</b><div className="muted" style={{ maxWidth: 280 }}>{i.description}</div></td>
                  <td>{i.category_name || '-'}</td>
                  <td>{money(i.price)}</td>
                  <td><button className={`chip ${i.availability ? 'on' : ''}`} onClick={() => toggle(i)}>{i.availability ? 'Available' : 'Unavailable'}</button></td>
                  <td><div className="row" style={{ gap: '.5rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(i)}><Pencil size={14} /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDel(i)}><Trash2 size={14} /> Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <Modal title={form.id ? 'Edit Food' : 'Add Food'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <div className="field"><label htmlFor="fn">Food Name</label><input id="fn" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="fd">Description</label><textarea id="fd" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="two-col">
              <div className="field"><label htmlFor="fp">Price</label><input id="fp" type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="field"><label htmlFor="fc">Category</label>
                <select id="fc" className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">No category</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
            </div>
            {cats.length === 0 && <p className="muted" style={{ marginBottom: '1rem' }}>Tip: add categories first on the Categories page.</p>}
            <div className="field"><label htmlFor="fi">Image (upload)</label><input id="fi" type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files[0] || null)} /></div>
            <div className="field"><label htmlFor="fu">...or image URL</label><input id="fu" className="input" placeholder="https://..." value={form.image.startsWith('/uploads/') ? '' : form.image} disabled={!!file} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              {form.image.startsWith('/uploads/') && !file && <span className="muted" style={{ fontSize: '.8rem' }}>Current image is an uploaded file. Choose a new file to replace it.</span>}</div>
            <label className="check" style={{ marginBottom: '1.2rem' }}>
              <input type="checkbox" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} /> Available for ordering
            </label>
            <div className="row">
              <button className="btn btn-gold" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {del && (
        <Modal title="Delete food" onClose={() => setDel(null)}>
          <p style={{ marginBottom: '1.2rem' }}>Are you sure you want to delete this food item?<br /><b className="gold">{del.name}</b></p>
          <div className="row"><button className="btn btn-danger" onClick={remove}>Delete</button><button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button></div>
        </Modal>
      )}
    </>
  );
}
