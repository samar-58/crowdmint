'use client';

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function WorkerPage(){
    return (
        <RoleGuard allowedRole="worker">

            <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
   <h1 className="text-2xl font-bold text-gray-900">Welcome to worker page</h1>

            </div>
        </RoleGuard>
    );
}

