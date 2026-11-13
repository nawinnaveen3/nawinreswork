import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Tags, Users, BarChart3, Mail, UserCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const links = [
  ['/owner', 'Dashboard', LayoutDashboard, true],
  ['/owner/orders', 'Orders', ClipboardList],
  ['/owner/menu', 'Menu Management', UtensilsCrossed],
  ['/owner/categories', 'Categories', Tags],
  ['/owner/customers', 'Customers', Users],
  ['/owner/reports', 'Sales & Reports', BarChart3],
  ['/owner/messages', 'Messages', Mail],
  ['/owner/profile', 'Profile', UserCircle],
];

export default function OwnerLayout() {
  const { logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    toast.success('Logged out successfully.');
    nav('/owner/login');
  };

  return (
    <div className="owner">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <span className="brand">NAWIN'S<br />OWNER PORTAL</span>
        {links.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon size={18} /> {label}</NavLink>
        ))}
        <button onClick={doLogout} style={{ marginTop: 'auto' }}><LogOut size={18} /> Logout</button>
      </aside>
      <div>
        <div className="owner-top">
          <button onClick={() => setOpen(!open)} aria-label="Toggle sidebar"><Menu /></button>
          <span className="brand">OWNER PORTAL</span>
        </div>
        <div className="owner-main"><Outlet /></div>
      </div>
    </div>
  );
}
