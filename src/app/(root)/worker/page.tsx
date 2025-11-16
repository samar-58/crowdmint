'use client';

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function WorkerPage(){
    return (
        <RoleGuard allowedRole="worker">
            <div className="flex flex-1 justify-center items-center ">
                Welcome to worker page
            </div>
        </RoleGuard>
    );
}

