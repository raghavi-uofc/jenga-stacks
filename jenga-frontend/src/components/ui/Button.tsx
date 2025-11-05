import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'secondary' | 'success' | 'warning';
  leftIcon?: React.ReactNode;
};

export default function Button({ variant = 'primary', className = '', leftIcon, children, ...props }: ButtonProps) {
  const base = 'btn';
  const variantClass = variant === 'outline' ? 'btn-outline' : `btn-${variant}`;
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {leftIcon ? <span className="mr-2 inline-flex items-center">{leftIcon}</span> : null}
      {children}
    </button>
  );
}
