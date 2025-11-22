import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500
          focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};
