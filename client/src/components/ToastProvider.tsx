import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border bg-white px-4 py-3 text-slate-950 shadow-xl ${
              toast.type === 'success'
                ? 'border-emerald-200'
                : toast.type === 'error'
                  ? 'border-rose-200'
                  : 'border-sky-200'
            }`}
          >
            <div className="flex gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
                }`}
              />
              <div>
                <p className="text-sm font-bold">{toast.title}</p>
                <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
