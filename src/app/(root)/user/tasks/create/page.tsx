'use client';

import Upload from "@/components/user/Upload";
import { RoleGuard } from "@/components/guards/RoleGuard";

export default function CreateTaskPage() {
    return (
        <RoleGuard allowedRole="user">
            <Upload />
        </RoleGuard>
    );
}