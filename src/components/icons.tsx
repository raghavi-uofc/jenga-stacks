import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };
const svg = (p: IconProps, path: React.ReactNode) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {path}
  </svg>
);

export const IconDashboard = (p: IconProps) => svg(p, <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>);
export const IconProjects = (p: IconProps) => svg(p, <><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></>);
export const IconPlusSquare = (p: IconProps) => svg(p, <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></>);
export const IconHistory = (p: IconProps) => svg(p, <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></>);
export const IconSettings = (p: IconProps) => svg(p, <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.07a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.07a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.4 1.31 1.02 1.58.32.14.66.21 1.02.21a2 2 0 0 1 0 4h-.07a1.65 1.65 0 0 0-1.51 1Z"/></>);

