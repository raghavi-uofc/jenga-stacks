import React from 'react';

export default function Pill({ children, variant }: React.PropsWithChildren<{ variant?: 'default' | 'success' | 'warning' | 'secondary' }>) {
  const v = variant && variant !== 'default' ? `pill-${variant}` : '';
  return <span className={`pill ${v}`.trim()}>{children}</span>;
}
