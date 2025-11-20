'use client';

import { RoleGuard } from "@/components/guards/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function UserPage() {
    return (
        <RoleGuard allowedRole="user">
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-zinc-400">Manage your tasks and view results</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card hoverEffect className="bg-zinc-900/50 border-zinc-800">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Create New Task</h2>
                                    <p className="text-zinc-400 mb-6">
                                        Upload images or text for labeling. Set your reward amount and get results fast.
                                    </p>
                                </div>
                                <Link href="/user/tasks/create">
                                    <Button className="w-full">Create Task</Button>
                                </Link>
                            </div>
                        </Card>

                        <Card hoverEffect className="bg-zinc-900/50 border-zinc-800">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">View All Tasks</h2>
                                    <p className="text-zinc-400 mb-6">
                                        Monitor progress and view results for your existing labeling tasks.
                                    </p>
                                </div>
                                <Link href="/user/tasks">
                                    <Button variant="outline" className="w-full">View Tasks</Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}