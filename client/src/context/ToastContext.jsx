import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const toast = useMemo(() => {
    const push = (type, msg) => {
      const id = Date.now() + Math.random();
      setList((l) => [...l, { id, type, msg }]);
      setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3800);
    };
    return { success: (m) => push('success', m), error: (m) => push('error', m) };
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
