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
    const { selectedRole, isLoading: roleLoading } = useRole();
    const router = useRouter();
    const { getToken } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        if (roleLoading) {
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
            router.push('/');
            return;
        }


        setIsVerifying(false);
    }, [selectedRole, allowedRole, router, roleLoading, getToken]);

    if (roleLoading || isVerifying) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p className="text-zinc-400 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

