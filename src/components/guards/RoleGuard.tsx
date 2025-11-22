'use client';

import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore, type UserRole } from '@/store/authStore';

interface RoleGuardProps {
    allowedRole: UserRole;
    children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
    const { selectedRole, isLoading: roleLoading, setSelectedRole } = useRole();
    const router = useRouter();
    const { getToken, isAuthenticating } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        if (roleLoading || isAuthenticating) {
            return;
        }

        if (selectedRole !== allowedRole) {
            console.log(`Access denied: role mismatch (expected ${allowedRole}, got ${selectedRole})`);
            router.push('/');
            return;
        }

        const token = getToken(allowedRole);
        if (!token) {
            console.log(`Access denied: no token found for ${allowedRole}`);
            setSelectedRole('unsigned');
            router.push('/');
            return;
        }


        setIsVerifying(false);
    }, [selectedRole, allowedRole, router, roleLoading, getToken, setSelectedRole, isAuthenticating]);

    if (roleLoading || isVerifying || isAuthenticating) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-2 border-white/20 animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-medium tracking-wide">Verifying Access</p>
                        <p className="text-zinc-500 text-sm">Please wait while we check your credentials...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

