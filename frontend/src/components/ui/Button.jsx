import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-primary-blue hover:bg-blue-700 text-text-main shadow-lg shadow-blue-900/15",
    secondary: "bg-card-bg hover:bg-slate-800 text-text-main border border-border-custom hover:border-slate-700",
    outline: "border border-border-custom text-text-sec hover:text-text-main hover:bg-slate-900 hover:border-slate-700",
    ghost: "text-text-sec hover:text-text-main hover:bg-slate-900",
    danger: "bg-error-red hover:bg-red-700 text-text-main shadow-lg shadow-red-950/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
