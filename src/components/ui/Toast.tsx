import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', open, onClose, duration = 2500 }: {
  message: string;
  type?: 'info' | 'success' | 'error';
  open: boolean;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  const color = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-zinc-800';
  return (
    <div className={`fixed bottom-4 right-4 z-50 text-white ${color} px-4 py-2 rounded-xl shadow-lg`}> {message} </div>
  );
}

