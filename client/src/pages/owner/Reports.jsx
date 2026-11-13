import { useCallback, useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import { ChartBox } from './OwnerDashboard';

const tip = { contentStyle: { background: '#1f130d', border: '1px solid #c9a24b', borderRadius: 8 } };
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function Reports() {
  const [group, setGroup] = useState('day');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { money } = useCart();
  const toast = useToast();

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const range = qs.toString() ? `&${qs}` : '';
    setData(null);
    Promise.all([
      api.get(`/dashboard/sales?group=${group}${range}`),
      api.get(`/dashboard/popular-items?${qs}`),
      api.get('/dashboard/statistics'),
    ]).then(([sales, popular, stats]) => setData({ sales, popular, stats })).catch((e) => setError(e.message));
  }, [group, from, to]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const lines = [['Period', 'Orders', 'Revenue'], ...data.sales.rows.map((r) => [r.period, r.orders, r.revenue]),
      [], ['Popular food', 'Quantity sold', 'Revenue'], ...data.popular.map((p) => [p.name, p.quantity, p.revenue])];
    const blob = new Blob([lines.map((l) => l.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nawins-sales-${group}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('CSV exported.');
  };

  if (error) return <div className="empty">{error}</div>;

  return (
    <>
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Sales & Reports</h1>
        <button className="btn btn-gold" onClick={exportCsv} disabled={!data}><Download size={16} /> Export CSV</button>
      </div>

      <div className="card row" style={{ marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0 }}><label htmlFor="g">View</label>
          <select id="g" className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option>
          </select></div>
        <div className="field" style={{ margin: 0 }}><label htmlFor="f">From</label><input id="f" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="field" style={{ margin: 0 }}><label htmlFor="t">To</label><input id="t" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setFrom(''); setTo(''); }}>Reset dates</button>
        <span className="muted" style={{ fontSize: '.85rem' }}>With no dates: last 30 days (daily), 12 weeks (weekly), 12 months (monthly).</span>
      </div>

      {!data ? <Spinner /> : (
        <>
          <div className="grid grid-stats" style={{ marginBottom: '1.5rem' }}>
            <div className="card stat"><b>{money(data.stats.totalRevenue)}</b><span>Total revenue (all time)</span></div>
            <div className="card stat"><b>{data.stats.totalOrders}</b><span>Total orders (all time)</span></div>
            <div className="card stat"><b>{money(data.sales.totals.revenue)}</b><span>Revenue in range</span></div>
            <div className="card stat"><b>{data.sales.totals.orders}</b><span>Orders in range</span></div>
            <div className="card stat"><b>{data.stats.totalCustomers}</b><span>Customers</span></div>
          </div>
          <div className="grid grid-2">
            <ChartBox title={`${group === 'day' ? 'Daily' : group === 'week' ? 'Weekly' : 'Monthly'} sales`} data={data.sales.rows}>
              <BarChart data={data.sales.rows}><CartesianGrid stroke="#432b1c" /><XAxis dataKey="period" stroke="#b8a893" fontSize={11} /><YAxis stroke="#b8a893" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="revenue" fill="#c9a24b" radius={[6, 6, 0, 0]} /></BarChart>
            </ChartBox>
            <ChartBox title="Popular food" data={data.popular}>
              <BarChart data={data.popular} layout="vertical"><CartesianGrid stroke="#432b1c" /><XAxis type="number" stroke="#b8a893" fontSize={11} /><YAxis type="category" dataKey="name" width={100} stroke="#b8a893" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="quantity" fill="#7fb685" radius={[0, 6, 6, 0]} /></BarChart>
            </ChartBox>
          </div>
        </>
      )}
    </>
  );
}
