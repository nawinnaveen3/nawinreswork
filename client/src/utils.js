export const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];
export const orderCode = (id) => `NR-${String(id).padStart(5, '0')}`;
export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const statusClass = (s) => `badge st-${s.toLowerCase().replace(/\s+/g, '-')}`;
