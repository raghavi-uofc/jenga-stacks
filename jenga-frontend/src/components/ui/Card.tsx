import React from 'react';

export default function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

