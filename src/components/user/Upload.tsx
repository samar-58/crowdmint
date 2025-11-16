"use client";
import { useState } from "react";
import UploadImage from "./UploadImage";
import { useCreateTask } from "@/hooks/useTask";
import { useRouter } from "next/navigation";
import { useWallet,useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

type LoadingState = 'idle' | 'sending' | 'confirming' | 'creating';
  
interface UploadedImage {
  key: string;
  url: string;
}

export default function Upload() {
  const {publicKey,sendTransaction} = useWallet();
  const {connection} = useConnection();

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [signature, setSignature] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
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
      setLoadingState('creating');
      const result = await createTask.mutateAsync({
        title: title.trim(),
        type: "IMAGE",
        signature: signature,
        amount: parseFloat(amount),
        options: uploadedImages.map(img => ({ imageUrl: img.url })),
      });

      alert(`Task created successfully! Task ID: ${result.taskId}`);
      router.push(`/user/tasks`);
      setTitle("");
      setAmount("");
      setUploadedImages([]);
      setSignature("");
      setLoadingState('idle');
    } catch (error) {
      console.error("Failed to create task:", error);
      setLoadingState('idle');
      alert("Failed to create task. Please try again.");
    }
  };

const handleSend = async () => {
  if(!publicKey || !connection){
    alert("Please connect your wallet");
    return;
  }
  try {
    setLoadingState('sending');
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("HDGdwAwR2kiuH3F9ByKFeijqtW8DWvWGrrxyzUJjf4uy"),
        lamports: Number(amount) * 10 ** 9,
      })
    )
    const signature = await sendTransaction(tx,connection)
    setLoadingState('confirming');
    await connection.confirmTransaction(signature, "confirmed")
    setSignature(signature)
    setLoadingState('idle');
    console.log("Transaction sent successfully", signature);
  } catch (error) {
    console.error("Failed to send transaction:", error);
    setLoadingState('idle');
    alert("Transaction failed. Please try again.");
  }
}

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

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Payment Status Card */}
          {signature && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-900 font-semibold text-lg">Payment Confirmed!</h3>
                  <p className="text-green-700 text-sm">Transaction: {signature.slice(0, 8)}...{signature.slice(-8)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Action Button */}
          <div className="flex justify-center">
            {uploadedImages.length > 0 && !signature && (
              <button
                onClick={handleSend}
                disabled={loadingState !== 'idle' || !amount || parseFloat(amount) <= 0}
                className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-12 py-4 rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg transform hover:scale-105 disabled:transform-none min-w-[280px]"
              >
                {loadingState === 'sending' && (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Payment...</span>
                  </span>
                )}
                {loadingState === 'confirming' && (
                  <span className="flex items-center justify-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>Confirming Transaction...</span>
                  </span>
                )}
                {loadingState === 'idle' && (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {amount ? `Pay ${amount} SOL` : 'Enter Amount'}
                  </span>
                )}
              </button>
            )}
            
            {signature && (
              <button
                onClick={handleCreateTask}
                disabled={loadingState !== 'idle'}
                className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-12 py-4 rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg transform hover:scale-105 disabled:transform-none min-w-[280px]"
              >
                {loadingState === 'creating' ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Task...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Helper Text */}
          {uploadedImages.length > 0 && !signature && (
            <p className="text-center text-sm text-gray-500">
              💡 You'll be prompted to approve the transaction in your wallet
            </p>
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
