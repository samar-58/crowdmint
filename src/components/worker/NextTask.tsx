"use client";
import { useNextTask, useSubmitTask } from "@/hooks/useTask";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

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

            // Artificial delay for smooth transition
            await new Promise(resolve => setTimeout(resolve, 800));

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

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-8 relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                </div>
                <p className="text-zinc-400 font-medium animate-pulse">Finding next task...</p>
            </div>
        );
    }

    // Empty State
    const isNoTasksError = error && (
        error.message.includes('411') ||
        error.message.toLowerCase().includes('no task found') ||
        error.message.toLowerCase().includes('no more tasks')
    );

    const noTasksAvailable = isNoTasksError || (data && data.task === null);

    if (noTasksAvailable) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-12 border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">All Caught Up!</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        You've completed all available tasks for now. Great work!
                        Check back later for more opportunities.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-medium"
                    >
                        Check for New Tasks
                    </Button>
                </Card>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 border-red-900/30 bg-red-950/10">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Load Task</h2>
                    <p className="text-zinc-400 mb-6">{error.message}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    if (!data?.task) return null;

    const task = data.task;

    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {isTransitioning ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="min-h-[50vh] flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Submission Received</h2>
                            <p className="text-zinc-400">Loading next task...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{task.title}</h1>
                                <p className="text-zinc-400 text-lg">Select the best matching option</p>
                            </div>
                            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-full px-5 py-2.5 backdrop-blur-sm">
                                <span className="text-zinc-400 font-medium text-sm">Reward</span>
                                <div className="h-4 w-px bg-zinc-700"></div>
                                <span className="text-green-400 font-bold font-mono">
                                    {formatAmount(task.amount / task.maximumSubmissions)} SOL
                                </span>
                            </div>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {task.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={submitTask.isPending || isTransitioning}
                                    className={`
                                        group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300
                                        ${selectedOption === option.id
                                            ? 'ring-2 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-[1.02] z-10'
                                            : 'hover:scale-[1.02] hover:shadow-xl hover:ring-1 hover:ring-white/20'
                                        }
                                    `}
                                >
                                    <img
                                        src={option.imageUrl}
                                        alt="Task Option"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    <div className={`
                                        absolute inset-0 transition-colors duration-300 flex items-center justify-center
                                        ${selectedOption === option.id ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-black/0 group-hover:bg-black/10'}
                                    `}>
                                        {selectedOption === option.id && (
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
                                            >
                                                {submitTask.isPending ? (
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Instructions */}
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Instructions
                            </h3>
                            <ul className="grid md:grid-cols-2 gap-3 text-zinc-400 text-sm leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-zinc-600 mt-1">•</span>
                                    Review all images carefully before selecting.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-zinc-600 mt-1">•</span>
                                    Choose the option that best matches the description.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-zinc-600 mt-1">•</span>
                                    Selections are final and cannot be changed.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-zinc-600 mt-1">•</span>
                                    Rewards are credited immediately upon consensus.
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}