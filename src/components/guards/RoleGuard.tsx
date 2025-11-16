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
    const { selectedRole } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (selectedRole !== allowedRole) {
            router.push('/');
        }
    }, [selectedRole, allowedRole, router]);

    if (selectedRole !== allowedRole) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

