import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        default: "bg-zinc-800 text-zinc-300 border-zinc-700",
        success: "bg-green-900/30 text-green-400 border-green-900/50",
        warning: "bg-yellow-900/30 text-yellow-400 border-yellow-900/50",
        danger: "bg-red-900/30 text-red-400 border-red-900/50",
        info: "bg-blue-900/30 text-blue-400 border-blue-900/50",
    };

    return (
        <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${variants[variant]}
      ${className}
    `}>
            {children}
        </span>
    );
};
