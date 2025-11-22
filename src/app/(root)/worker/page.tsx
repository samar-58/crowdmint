"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function WorkerPage() {
    return (
        <RoleGuard allowedRole="worker">
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Worker Dashboard</h1>
                        <p className="text-zinc-400">Start earning by completing tasks</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card hoverEffect className="bg-zinc-900/50 border-zinc-800">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Start Earning</h2>
                                    <p className="text-zinc-400 mb-6">
                                        View available tasks and start earning SOL immediately.
                                    </p>
                                </div>
                                <Link href="/worker/task">
                                    <Button className="w-full">Go to Tasks</Button>
                                </Link>
                            </div>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800 opacity-75">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6">
                                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-zinc-500 mb-2">Earnings (Coming Soon)</h2>
                                    <p className="text-zinc-600 mb-6">
                                        Detailed analytics of your earnings and task history.
                                    </p>
                                </div>
                                <Button disabled variant="secondary" className="w-full">Coming Soon</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
