'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore, type UserRole } from '@/store/authStore';

type Role = UserRole | 'unsigned';

interface RoleContextType {
    selectedRole: Role;
    setSelectedRole: (role: Role) => void;
    isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [selectedRole, setSelectedRoleState] = useState<Role>('unsigned');
    const [isLoading, setIsLoading] = useState(true);
    const { getToken, removeToken } = useAuthStore();

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');

        if (savedRole === 'user' || savedRole === 'worker') {
            const token = getToken(savedRole);

            if (token) {
                setSelectedRoleState(savedRole);
            } else {
                console.log(`No token found for saved role ${savedRole}, resetting to unsigned`);
                localStorage.removeItem('userRole');
                setSelectedRoleState('unsigned');
            }
        }

        setIsLoading(false);
    }, [getToken]);

    const setSelectedRole = useCallback((role: Role) => {
        setSelectedRoleState(role);
        if (role === 'unsigned') {
            localStorage.removeItem('userRole');
        } else {
            localStorage.setItem('userRole', role);
        }
    }, []);

    const value = useMemo(() => ({
        selectedRole,
        setSelectedRole,
        isLoading
    }), [selectedRole, setSelectedRole, isLoading]);

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
}

