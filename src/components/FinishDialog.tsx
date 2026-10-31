import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Square } from 'lucide-react';

interface FinishDialogProps {
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FinishDialog({ children, onConfirm, onCancel }: FinishDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    cancelRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const handleKeys = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
    }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="session-confirm fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-describedby={descriptionId} onKeyDown={handleKeys}
        className="bg-board-card border border-board-border rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-marker-red/10 text-marker-red flex items-center justify-center mx-auto"><Square className="w-5 h-5 fill-current" /></div>
        <div><h3 id={titleId}>End Session?</h3><p id={descriptionId} className="text-ink-muted mt-2">{children}</p></div>
        <div className="space-y-2">
          <button type="button" onClick={onConfirm} className="w-full py-3 bg-marker-red hover:bg-marker-red-hover text-[#101214] font-semibold text-sm rounded-xl transition-colors">Yes, Finish Now</button>
          <button ref={cancelRef} type="button" onClick={onCancel} className="w-full py-3 bg-board border border-board-border text-ink-main font-semibold text-sm rounded-xl hover:bg-board-border/40 transition-colors">Cancel — Keep Going</button>
        </div>
      </div>
    </div>
  );
}
