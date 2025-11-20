"use client";
import { useNextTask, useSubmitTask } from "@/hooks/useTask";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NextTask() {
    const { data, isLoading, error } = useNextTask();
    const submitTask = useSubmitTask();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleOptionClick = async (optionId: string) => {
        if (submitTask.isPending || !data?.task || isTransitioning) return;

        setSelectedOption(optionId);

        try {
            setIsTransitioning(true);

            await submitTask.mutateAsync({
                taskId: data.task.id,
                optionId: optionId,
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsTransitioning(false);
            setSelectedOption(null);
        } catch (err) {
            console.error("Submission failed:", err);
            setSelectedOption(null);
            setIsTransitioning(false);
        }
    };

    const formatAmount = (amount: number) => {
        return (amount / 1_000_000_000).toFixed(4);
    };

    if (isTransitioning) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Card className="p-16 max-w-md w-full text-center bg-zinc-900/50 border-zinc-800">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-900/20 rounded-full mb-4">
                            <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Perfect!
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Your submission was successful!
                    </p>
                    <div className="mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    </div>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-zinc-400 text-lg">Loading task...</p>
                </div>
            </div>
        );
    }

    const isNoTasksError = error && (
        error.message.includes('411') ||
        error.message.toLowerCase().includes('no task found') ||
        error.message.toLowerCase().includes('no more tasks')
    );

    const noTasksAvailable = isNoTasksError || (data && data.task === null);

    if (noTasksAvailable) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="p-12 max-w-md w-full text-center bg-zinc-900/50 border-zinc-800">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        All Caught Up!
                    </h2>
                    <p className="text-zinc-400 text-lg mb-2">
                        You've completed all available tasks.
                    </p>
                    <p className="text-zinc-500 text-sm mb-6">
                        Check back later for more opportunities to earn.
                    </p>
                    <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4 mb-6">
                        <p className="text-green-400 font-medium text-sm">
                            Rewards added to pending balance
                        </p>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        Check for New Tasks
                    </Button>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="p-8 max-w-md w-full text-center bg-zinc-900/50 border-zinc-800">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Error Loading Task</h2>
                    <p className="text-zinc-400 mb-4">{error.message}</p>
                    <Button
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    if (!data?.task) {
        return null;
    }

    const task = data.task;

    return (
        <div className="max-w-5xl mx-auto">
            <Card className="p-8 mb-8 bg-zinc-900/50 border-zinc-800">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-3">
                            {task.title}
                        </h1>
                        <p className="text-zinc-400">
                            Select the best option from the choices below
                        </p>
                    </div>
                    <div className="bg-green-900/20 px-6 py-3 rounded-xl border border-green-900/50">
                        <p className="text-sm text-green-400 font-medium mb-1">Reward</p>
                        <p className="text-2xl font-bold text-green-500">
                            {formatAmount(task.amount / task.maximumSubmissions)} SOL
                        </p>
                    </div>
                </div>
            </Card>

            <Card className="p-8 bg-zinc-900/50 border-zinc-800">
                <h2 className="text-xl font-semibold text-white mb-6">
                    Choose one option:
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {task.options.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={submitTask.isPending || isTransitioning}
                            className={`group relative rounded-xl overflow-hidden transition-all duration-200 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-60 ${selectedOption === option.id
                                ? 'ring-2 ring-white shadow-lg'
                                : 'border border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            <div className="aspect-square bg-zinc-800 overflow-hidden">
                                <img
                                    src={option.imageUrl}
                                    alt={`Option ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                <p className="text-sm font-medium text-white">
                                    Option {index + 1}
                                </p>
                            </div>

                            {selectedOption === option.id && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-white rounded-full p-3 shadow-xl">
                                        {submitTask.isPending ? (
                                            <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {submitTask.isError && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                        <p className="text-red-400 text-center font-medium">
                            ⚠️ Submission failed. Please try again.
                        </p>
                    </div>
                )}
            </Card>

            <div className="mt-8 bg-blue-900/10 rounded-xl p-6 border border-blue-900/20">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h3 className="font-semibold text-blue-400 mb-2">How it works:</h3>
                        <ul className="text-blue-300 text-sm space-y-1">
                            <li>• Review all the options carefully</li>
                            <li>• Click on the image that best matches the task description</li>
                            <li>• Your selection will be submitted automatically</li>
                            <li>• You'll receive the next task immediately after submission</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}