"use client";

import { useAllTasks } from "@/hooks/useTask";
import { RoleGuard } from "@/components/guards/RoleGuard";

export default function TasksPage() {
    const { data: tasks, isLoading: loading, error } = useAllTasks();

    const formatAmount = (amount: number) => {
        return (amount / 1_000_000_000).toFixed(4);
    };

    if (loading) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading tasks...</p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (error) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tasks</h2>
                        <p className="text-gray-600 mb-4">{error.message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <RoleGuard allowedRole="user">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tasks Found</h2>
                        <p className="text-gray-600">No tasks have been created yet. Be the first to create one!</p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRole="user">
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tasks</h1>
                        <p className="text-gray-600">Browse and view voting results for all tasks</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                            {task.title}
                                        </h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                            {task.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <span className="font-medium text-blue-600">
                                            {formatAmount(task.amount)} SOL
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>{task.totalVotes} votes</span>
                                        <span className="mx-2">•</span>
                                        <span className={task.done ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                                            {task.done ? "Completed" : "In Progress"}
                                        </span>
                                    </div>

                                    {task.type === "IMAGE" && task.options.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Voting Results:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {task.options.map((option) => (
                                                    <div key={option.id} className="relative group">
                                                        <img
                                                            src={option.imageUrl || ''}
                                                            alt="Option"
                                                            className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                                                        />
                                                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-lg">
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
                                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                                <span>Option {task.options.indexOf(option) + 1}</span>
                                                                <span>{percentage.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Voting Results:</h4>
                                            {task.options.map((option) => {
                                                const percentage = task.totalVotes > 0
                                                    ? (option.count / task.totalVotes) * 100
                                                    : 0;

                                                return (
                                                    <div key={option.id} className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Option {task.options.indexOf(option) + 1}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">{option.count} votes</span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}