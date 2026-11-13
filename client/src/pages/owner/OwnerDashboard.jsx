import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/Spinner';

const COLORS = ['#c9a24b', '#7ab6e0', '#e09a5a', '#a58be0', '#5fcfc4', '#7fb685', '#e0685a'];
const tip = { contentStyle: { background: '#1f130d', border: '1px solid #c9a24b', borderRadius: 8 } };

export function ChartBox({ title, data, children }) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      {data.length === 0 ? <div className="empty">No data yet.</div> : <div className="chart-box"><ResponsiveContainer>{children}</ResponsiveContainer></div>}
    </div>
  );
}

export default function OwnerDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const { money } = useCart();

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/statistics'),
      api.get('/dashboard/sales?group=day'),
      api.get('/dashboard/sales?group=month'),
      api.get('/dashboard/popular-items'),
    ]).then(([stats, daily, monthly, popular]) => setD({ stats, daily: daily.rows, monthly: monthly.rows, popular }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="empty">{error}</div>;
  if (!d) return <Spinner />;
  const s = d.stats;
  const cards = [
    ['Total Orders', s.totalOrders], ["Today's Orders", s.todaysOrders], ['Total Customers', s.totalCustomers],
    ['Total Menu Items', s.totalMenuItems], ["Today's Sales", money(s.todaysSales)], ['Monthly Sales', money(s.monthlySales)],
  ];

  return (
    <>
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Dashboard</h1></div>
      <div className="grid grid-stats" style={{ marginBottom: '1.5rem' }}>
        {cards.map(([label, v]) => <div className="card stat" key={label}><b>{v}</b><span>{label}</span></div>)}
      </div>
      <div className="grid grid-2">
        <ChartBox title="Daily sales (last 30 days)" data={d.daily}>
          <LineChart data={d.daily}><CartesianGrid stroke="#432b1c" /><XAxis dataKey="period" stroke="#b8a893" fontSize={11} /><YAxis stroke="#b8a893" fontSize={11} /><Tooltip {...tip} /><Line type="monotone" dataKey="revenue" stroke="#c9a24b" strokeWidth={2} /></LineChart>
        </ChartBox>
        <ChartBox title="Monthly sales (last 12 months)" data={d.monthly}>
          <BarChart data={d.monthly}><CartesianGrid stroke="#432b1c" /><XAxis dataKey="period" stroke="#b8a893" fontSize={11} /><YAxis stroke="#b8a893" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="revenue" fill="#c9a24b" radius={[6, 6, 0, 0]} /></BarChart>
        </ChartBox>
        <ChartBox title="Order status" data={s.orderStatus}>
          <PieChart><Pie data={s.orderStatus} dataKey="count" nameKey="status" outerRadius={95} label>{s.orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip {...tip} /></PieChart>
        </ChartBox>
        <ChartBox title="Popular food items" data={d.popular}>
          <BarChart data={d.popular} layout="vertical"><CartesianGrid stroke="#432b1c" /><XAxis type="number" stroke="#b8a893" fontSize={11} /><YAxis type="category" dataKey="name" width={100} stroke="#b8a893" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="quantity" fill="#7fb685" radius={[0, 6, 6, 0]} /></BarChart>
        </ChartBox>
      </div>
    </>
  );
}
