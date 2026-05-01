import { useApp } from '../../context/AppContext.jsx';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          {t.icon} {t.msg}
        </div>
      ))}
    </div>
  );
}
