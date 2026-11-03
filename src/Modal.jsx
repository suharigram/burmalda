import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose, className = '', label }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    panelRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll('button, a, input, select, textarea, [tabindex="0"]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label} ref={panelRef} tabIndex={-1}>
        <button className="modal__close icon-button" onClick={onClose} aria-label="Close dialog"><X size={22} /></button>
        {children}
      </section>
    </div>
  );
}
