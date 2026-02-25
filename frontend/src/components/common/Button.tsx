import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'btn';
  let variantClasses = 'btn-primary';
  let sizeClasses = '';

  if (variant === 'primary') {
    variantClasses = 'btn-primary';
  } else if (variant === 'secondary') {
    variantClasses = 'btn-secondary';
  } else if (variant === 'ghost') {
    variantClasses = 'btn-ghost';
  }

  if (size === 'sm') {
    sizeClasses = 'text-sm px-3 py-1.5';
  } else if (size === 'lg') {
    sizeClasses = 'text-lg px-6 py-3';
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
