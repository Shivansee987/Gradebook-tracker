import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toastContext";

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toastItem) => toastItem.id !== id),
    );
  }, []);

  const pushToast = useCallback(
    ({ type = "info", title, message, duration = 3500 }) => {
      // Generate a stable unique id so we can animate and remove individual toasts.
      const id = `toast-${Date.now()}-${toastCounter++}`;

      const nextToast = {
        id,
        type,
        title,
        message,
      };

      setToasts((currentToasts) => [...currentToasts, nextToast]);

      // Auto-dismiss keeps the UI clean for repeated actions like refresh/login.
      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
    }),
    [toasts, pushToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onClose }) {
  return (
    <aside className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toastItem) => (
        <article key={toastItem.id} className={`toast toast-${toastItem.type}`}>
          <div>
            {toastItem.title && <h4>{toastItem.title}</h4>}
            {toastItem.message && <p>{toastItem.message}</p>}
          </div>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={() => onClose(toastItem.id)}
          >
            x
          </button>
        </article>
      ))}
    </aside>
  );
}
