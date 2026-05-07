import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Neo-brutalist Button component
 * Use in both landing and admin apps
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-bold uppercase tracking-wider
    border-3 border-black
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:translate-x-1 active:translate-y-1 active:shadow-none
  `;

  const variants = {
    primary: 'bg-orange-500 text-black hover:bg-orange-400 shadow-brutal',
    secondary: 'bg-blue-500 text-white hover:bg-blue-400 shadow-brutal',
    accent: 'bg-lime-400 text-black hover:bg-lime-300 shadow-brutal',
    outline: 'bg-white text-black hover:bg-gray-100 shadow-brutal',
    ghost: 'bg-transparent text-black hover:bg-gray-100 border-0 shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
