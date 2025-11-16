'use client';

import NextTask from "@/components/worker/NextTask";
import { RoleGuard } from "@/components/guards/RoleGuard";

export default function TaskPage(){
    return (
        <RoleGuard allowedRole="worker">
            <div className="min-h-screen bg-gray-50 ">
                <NextTask />
            </div>
        </RoleGuard>
    )
}