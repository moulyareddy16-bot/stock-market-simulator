import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-fade-in transition-all ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-black border-emerald-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <p className="font-black text-sm">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
