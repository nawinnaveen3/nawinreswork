import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import { fmtDate } from '../../utils';

export default function OwnerMessages() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/contact').then(setList).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="empty">{error}</div>;
  if (!list) return <Spinner />;
  return (
    <>
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Contact Messages</h1></div>
      {list.length === 0 ? <div className="empty">No messages yet.</div> : (
        <div className="grid">
          {list.map((m) => (
            <div className="card" key={m.id}>
              <div className="row between"><b>{m.name}</b><span className="muted">{fmtDate(m.created_at)}</span></div>
              <div className="muted">{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
              <p style={{ marginTop: '.7rem', whiteSpace: 'pre-wrap' }}>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
