'use client';

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function UserPage(){
    return (
        <RoleGuard allowedRole="user">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
                <h1 className="text-2xl font-bold text-gray-900">Welcome to user page</h1>
            </div>
        </RoleGuard>
    );
}