import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
    <svg
        width="200"
        height="60"
        viewBox="0 0 400 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g transform="translate(0, 0) scale(0.8)">
            <circle cx="50" cy="80" r="4" fill="white" />
            <circle cx="50" cy="50" r="5" fill="white" />
            <circle cx="50" cy="20" r="4" fill="white" />
            <path d="M50 80 L50 20 M50 80 L30 65 M30 65 L25 45 M25 45 L35 30 M35 30 L50 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 80 L70 65 M70 65 L75 45 M75 45 L65 30 M65 30 L50 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 50 L48 56 L60 44" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="90" y="55" fontFamily="'Outfit', sans-serif" fontWeight="800" fontSize="40" fill="white" letterSpacing="-1">CROWDMINT</text>
    </svg>
);
