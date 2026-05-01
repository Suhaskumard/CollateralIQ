import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

let _setToasts = null;

export function toast(icon, msg) {
  if (!_setToasts) return;
  const id = Date.now();
  _setToasts(t => [...t, { id, icon, msg }]);
  setTimeout(() => _setToasts(t => t.filter(x => x.id !== id)), 3500);
}

export function AppProvider({ children }) {
  const [page, setPage]     = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  const navigate = useCallback((p) => setPage(p), []);

  return (
    <AppContext.Provider value={{ page, navigate, toasts }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
