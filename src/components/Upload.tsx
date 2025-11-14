"use client";
import { useState } from "react";
import UploadImage from "./UploadImage";
import { useCreateTask } from "@/hooks/useTask";

interface UploadedImage {
  key: string;
  url: string;
}

export default function Upload() {
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
      
      // Reset form
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
    <div className="flex flex-col justify-center items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Create New Task</h1>

      {/* Task Description Input */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <label htmlFor="title" className="font-semibold text-gray-700">
          Task Description
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your task description"
          className="h-12 px-4 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
        />
      </div>

      {/* Amount Input */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <label htmlFor="amount" className="font-semibold text-gray-700">
          Amount (SOL)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in SOL"
          className="h-12 px-4 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
        />
      </div>

      {/* Upload Images Component */}
      <UploadImage onImagesChange={handleImagesChange} />

      {/* Create Task Button */}
      {uploadedImages.length > 0 && (
        <button
          onClick={handleCreateTask}
          disabled={createTask.isPending}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {createTask.isPending ? "Creating Task..." : "Create Task"}
        </button>
      )}

      {createTask.isError && (
        <p className="text-red-500 text-sm">
          Error: {createTask.error?.message || "Failed to create task"}
        </p>
      )}
    </div>
  );
}
