'use client';

import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/store/authStore';

interface RoleGuardProps {
    allowedRole: UserRole;
    children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
    const { selectedRole, isLoading } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && selectedRole !== allowedRole) {
            router.push('/');
        }
    }, [selectedRole, allowedRole, router, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (selectedRole !== allowedRole) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}

