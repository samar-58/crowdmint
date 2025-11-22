import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverEffect = false
}) => {
    return (
        <div
            className={`
        bg-[#111111] border border-zinc-800 rounded-xl p-6
        ${hoverEffect ? 'transition-colors duration-200 hover:border-zinc-700' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
