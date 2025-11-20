"use client";

import { useAllTasks } from "@/hooks/useTask";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TasksPage() {
    const { data: tasks, isLoading: loading, error } = useAllTasks();

    const formatAmount = (amount: number) => {
        return (amount / 1_000_000_000).toFixed(4);
    };

    if (loading) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-zinc-400">Loading tasks...</p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (error) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Tasks</h2>
                        <p className="text-zinc-400 mb-4">{error.message}</p>
                        <Button
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-zinc-500 text-6xl mb-4">📋</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Tasks Found</h2>
                        <p className="text-zinc-400">No tasks have been created yet. Be the first to create one!</p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRole="user">
            <div className="min-h-screen bg-background py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">All Tasks</h1>
                        <p className="text-zinc-400">Browse and view voting results for all tasks</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tasks.map((task) => (
                            <Card key={task.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                                            {task.title}
                                        </h3>
                                        <Badge variant="default" className="border-zinc-700 text-zinc-300">
                                            {task.type}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center text-sm text-zinc-400 mb-4">
                                        <span className="font-medium text-white">
                                            {formatAmount(task.amount)} SOL
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>{task.totalVotes} votes</span>
                                        <span className="mx-2">•</span>
                                        <span className={task.done ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>
                                            {task.done ? "Completed" : "In Progress"}
                                        </span>
                                    </div>

                                    {task.type === "IMAGE" && task.options.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-zinc-300 mb-2">Voting Results:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {task.options.map((option) => (
                                                    <div key={option.id} className="relative group">
                                                        <img
                                                            src={option.imageUrl || ''}
                                                            alt="Option"
                                                            className="w-full h-20 object-cover rounded-lg border border-zinc-800"
                                                        />
                                                        <div className="absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-tl-lg border-t border-l border-zinc-800">
                                                            {option.count} votes
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Vote distribution bar */}
                                            <div className="mt-3">
                                                {task.options.map((option) => {
                                                    const percentage = task.totalVotes > 0
                                                        ? (option.count / task.totalVotes) * 100
                                                        : 0;

                                                    return (
                                                        <div key={option.id} className="mb-1">
                                                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                                                <span>Option {task.options.indexOf(option) + 1}</span>
                                                                <span>{percentage.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-white h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {task.type === "TEXT" && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-zinc-300 mb-2">Voting Results:</h4>
                                            {task.options.map((option) => {
                                                const percentage = task.totalVotes > 0
                                                    ? (option.count / task.totalVotes) * 100
                                                    : 0;

                                                return (
                                                    <div key={option.id} className="flex items-center justify-between">
                                                        <span className="text-sm text-zinc-400">Option {task.options.indexOf(option) + 1}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-zinc-500">{option.count} votes</span>
                                                            <div className="w-16 bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-white h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}