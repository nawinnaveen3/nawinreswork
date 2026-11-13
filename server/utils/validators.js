exports.isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
exports.isPhone = (v) => typeof v === 'string' && /^\+?[\d\s-]{7,15}$/.test(v.trim());
exports.isUsername = (v) => typeof v === 'string' && /^[A-Za-z0-9_]{3,30}$/.test(v.trim());
exports.isStrongPassword = (v) => typeof v === 'string' && v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
exports.str = (v) => (typeof v === 'string' ? v.trim() : '');
exports.round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
