"use client";
import { useNextTask, useSubmitTask } from "@/hooks/useTask";
import { useState } from "react";

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
            
            const result = await submitTask.mutateAsync({
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
            <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="bg-white rounded-2xl shadow-xl p-16 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-pulse">
                            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Perfect! ✨
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Your submission was successful!
                    </p>
                    <div className="mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading task...</p>
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
            <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Congratulations!
                    </h2>
                    <p className="text-gray-600 text-lg mb-2">
                        You've completed all available tasks!
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Great job! Check back later for more opportunities to earn.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700 font-medium text-sm">
                            Your rewards have been added to your pending balance
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium transform hover:scale-105"
                    >
                        🔄 Check for New Tasks
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Task</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data?.task) {
        return null;
    }

    const task = data.task;

    return (
        <div className="min-h-[80vh] bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                {task.title}
                            </h1>
                            <p className="text-gray-600">
                                Select the best option from the choices below
                            </p>
                        </div>
                        <div className="bg-green-50 px-6 py-3 rounded-xl border-2 border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-1">Reward</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatAmount(task.amount / task.maximumSubmissions)} SOL
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Choose one option:
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {task.options.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.id)}
                                disabled={submitTask.isPending || isTransitioning}
                                className={`group relative rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-60 ${
                                    selectedOption === option.id
                                        ? 'ring-4 ring-blue-500 shadow-2xl'
                                        : 'ring-2 ring-gray-200 hover:ring-blue-400 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                    <img
                                        src={option.imageUrl}
                                        alt={`Option ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                </div>

                                <div className="absolute top-3 left-3 bg-white px-4 py-2 rounded-full shadow-md">
                                    <p className="text-sm font-bold text-gray-900">
                                        Option {index + 1}
                                    </p>
                                </div>

                                {selectedOption === option.id && (
                                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                                        <div className="bg-white rounded-full p-3 shadow-xl">
                                            {submitTask.isPending ? (
                                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>

                    {submitTask.isError && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-center font-medium">
                                ⚠️ Submission failed. Please try again.
                            </p>
                        </div>
                    )}
                </div>
                    
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                            <ul className="text-blue-800 text-sm space-y-1">
                                <li>• Review all the options carefully</li>
                                <li>• Click on the image that best matches the task description</li>
                                <li>• Your selection will be submitted automatically</li>
                                <li>• You'll receive the next task immediately after submission</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}