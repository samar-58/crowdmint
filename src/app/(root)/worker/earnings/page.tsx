"use client";

import { useEarnings, formatSolAmount } from "@/hooks/useEarnings";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";

export default function EarningsPage() {
    const { data, isLoading, error } = useEarnings();
    const [activeTab, setActiveTab] = useState<'submissions' | 'payouts'>('submissions');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <p className="text-red-400 mb-4">Failed to load earnings data</p>
                <Link href="/worker">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <RoleGuard allowedRole="worker">
            <div className="min-h-screen bg-black p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/worker" className="text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Earnings & History</h1>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                            <p className="text-zinc-400 text-sm mb-1">Total Earned</p>
                            <p className="text-2xl font-bold text-green-400">{formatSolAmount(data.summary.totalEarned)} SOL</p>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                            <p className="text-zinc-400 text-sm mb-1">Pending Balance</p>
                            <p className="text-2xl font-bold text-yellow-400">{formatSolAmount(data.summary.pendingBalance)} SOL</p>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                            <p className="text-zinc-400 text-sm mb-1">Locked (Processing)</p>
                            <p className="text-2xl font-bold text-blue-400">{formatSolAmount(data.summary.lockedBalance)} SOL</p>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                            <p className="text-zinc-400 text-sm mb-1">Tasks Completed</p>
                            <p className="text-2xl font-bold text-white">{data.summary.totalTasks}</p>
                        </Card>
                    </div>

                    {/* History Section */}
                    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                        <div className="flex border-b border-zinc-800">
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'submissions'
                                        ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                Task History
                            </button>
                            <button
                                onClick={() => setActiveTab('payouts')}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'payouts'
                                        ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                Payout History
                            </button>
                        </div>

                        <div className="p-0">
                            {activeTab === 'submissions' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Task</th>
                                                <th className="px-6 py-4 font-medium">Date</th>
                                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800">
                                            {data.submissions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                                                        No tasks completed yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.submissions.map((sub) => (
                                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-white font-medium">{sub.taskTitle}</td>
                                                        <td className="px-6 py-4 text-zinc-400 text-sm">
                                                            {new Date(sub.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-green-400 font-mono text-right">
                                                            +{formatSolAmount(sub.amount)} SOL
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">ID</th>
                                                <th className="px-6 py-4 font-medium">Date</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800">
                                            {data.payouts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                        No payouts yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.payouts.map((payout) => (
                                                    <tr key={payout.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                                                            {payout.id.slice(0, 8)}...
                                                        </td>
                                                        <td className="px-6 py-4 text-zinc-400 text-sm">
                                                            {new Date(payout.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'SUCCESS' ? 'bg-green-900/30 text-green-400' :
                                                                    payout.status === 'PROCESSING' ? 'bg-blue-900/30 text-blue-400' :
                                                                        payout.status === 'FAILED' ? 'bg-red-900/30 text-red-400' :
                                                                            'bg-zinc-800 text-zinc-400'
                                                                }`}>
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-white font-mono text-right">
                                                            {formatSolAmount(payout.amount)} SOL
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
