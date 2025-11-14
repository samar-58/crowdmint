"use client";
import { useState } from "react";
import UploadImage from "./UploadImage";
import { useCreateTask } from "@/hooks/useTask";
import { useRouter } from "next/navigation";
  
interface UploadedImage {
  key: string;
  url: string;
}

export default function Upload() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const createTask = useCreateTask();

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task description");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (uploadedImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    try {
      const result = await createTask.mutateAsync({
        title: title.trim(),
        type: "IMAGE",
        signature: "hardcoded-signature-placeholder",
        amount: parseFloat(amount),
        options: uploadedImages.map(img => ({ imageUrl: img.url })),
      });

      alert(`Task created successfully! Task ID: ${result.taskId}`);
      router.push(`/user/tasks`);
      setTitle("");
      setAmount("");
      setUploadedImages([]);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create New Task
          </h1>
          <p className="text-gray-600 text-lg">
            Set up your crowdsourcing task in just a few steps
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-8">
            {/* Task Description Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                Task Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Select the best logo design"
                className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear description of what you want people to do
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-900">
                Reward Amount (SOL)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  SOL
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total amount to be distributed among workers
              </p>
            </div>
          </div>
        </div>

        {/* Upload Images Component */}
        <UploadImage onImagesChange={handleImagesChange} />

        {/* Create Task Button */}
        <div className="mt-8 flex justify-center">
          {uploadedImages.length > 0 && (
            <button
              onClick={handleCreateTask}
              disabled={createTask.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-12 py-4 rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg transform hover:scale-105 disabled:transform-none"
            >
              {createTask.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Task...
                </span>
              ) : (
                "🚀 Create Task"
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {createTask.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ Error: {createTask.error?.message || "Failed to create task"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
