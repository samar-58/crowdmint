"use client";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { UploadImage } from "@/components/user/UploadImage";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Upload() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!publicKey || !txSignature || loading) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/user/task", {
        options: images.map(image => ({
          imageUrl: image,
        })),
        title,
        signature: txSignature
      }, {
        headers: {
          "Authorization": localStorage.getItem("token")
        }
      });

      router.push(`/user/tasks`);
    } catch (e) {
      console.error(e);
      alert("Error creating task");
    } finally {
      setLoading(false);
    }
  }

  async function signTransaction() {
    if (!publicKey) {
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("22W7X1sQY3y5F9Z6r8q5h1Z6r8q5h1Z6r8q5h1Z6r8q5"),
          lamports: 100000000, // 0.1 SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTxSignature(signature);
    } catch (e) {
      console.error(e);
      alert("Error signing transaction");
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Task</h1>
          <p className="text-zinc-400">Upload images and set rewards for labelers</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Task Details
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter a descriptive title for your task (e.g. 'Select the best thumbnail')"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Upload Images
                </label>
                <UploadImage onImageUpload={(imageUrl) => {
                  setImages(prev => [...prev, imageUrl]);
                }} />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Payment</h3>
                <p className="text-sm text-zinc-400">Transaction required to publish task</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">0.1 SOL</p>
                <p className="text-xs text-zinc-500">Network fees may apply</p>
              </div>
            </div>

            {txSignature ? (
              <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-green-400 font-medium text-sm">Payment Confirmed</p>
                  <p className="text-green-500/70 text-xs truncate">{txSignature}</p>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm">
                  Please verify the transaction in your wallet to proceed.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              {txSignature ? (
                <Button
                  onClick={onSubmit}
                  isLoading={loading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Publish Task
                </Button>
              ) : (
                <Button
                  onClick={signTransaction}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Pay 0.1 SOL
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
