'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '@/store/authStore';

type Role = UserRole | 'unsigned';

interface RoleContextType {
    selectedRole: Role;
    setSelectedRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [selectedRole, setSelectedRoleState] = useState<Role>('unsigned');

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        if (savedRole === 'user' || savedRole === 'worker') {
            setSelectedRoleState(savedRole);
        }
    }, []);

    const setSelectedRole = (role: Role) => {
        setSelectedRoleState(role);
        if (role === 'unsigned') {
            localStorage.removeItem('userRole');
        } else {
            localStorage.setItem('userRole', role);
        }
    };

    return (
        <RoleContext.Provider value={{ selectedRole, setSelectedRole }}>
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

