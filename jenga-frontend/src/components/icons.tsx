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

// Filled Apple logo
export const IconApple = ({ size = 24, ...p }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 315"
    fill="currentColor"
    aria-hidden="true"
    {...p}
  >
    <path d="M213.803 167.584c.388 41.89 36.812 55.85 37.232 56.02-.308.99-5.828 19.95-19.205 39.54-11.557 16.88-23.548 33.69-42.49 34.02-18.58.35-24.55-10.99-45.78-10.99-21.22 0-27.85 10.64-45.39 11.34-18.27.7-32.19-18.25-43.82-35.07-23.84-34.6-42.05-97.66-17.6-140.27 12.16-21.09 33.88-34.42 57.53-34.77 17.96-.35 34.89 12.33 45.79 12.33 10.86 0 31.54-15.25 53.17-13.03 9.06.38 34.54 3.68 50.86 27.67-1.32.82-30.4 17.77-30.36 53.2Zm-35.05-103.8c9.61-11.64 16.09-27.79 14.31-43.78-13.85.56-30.72 9.22-40.69 20.86-8.93 10.31-16.7 26.78-14.62 42.6 15.47 1.2 31.39-7.86 41-19.68Z"/>
  </svg>
);
