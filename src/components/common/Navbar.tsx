"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Navbar({
    role,
    pendingBalance,
    lockedBalance,
    hideWallet = false
}: {
    role: UserRole | "unsigned",
    pendingBalance: number,
    lockedBalance: number,
    hideWallet?: boolean
}): React.ReactNode {
    const { publicKey, signMessage, connected } = useWallet();
    const router = useRouter();
    const hasAttemptedAuth = useRef(false);

    const {
        getToken,
        setToken,
        removeToken,
        verifyToken,
        isAuthenticating,
        setAuthenticating
    } = useAuthStore();

    const signIn = useCallback(async () => {
        if (role === "unsigned" || !connected || !signMessage || isAuthenticating) {
            return;
        }

        const existingToken = getToken(role);
        if (existingToken) {
            console.log(`${role} already has a valid token, skipping sign-in`);
            return;
        }

        setAuthenticating(true);

        try {
            const signature = await signMessage(new TextEncoder().encode("Sign in to Crowdmint"));

            const response = await axios.post(`/api/${role}/signin`, {
                publicKey: publicKey?.toString(),
                signature
            });

            if (response.status === 200 && response.data.token) {
                setToken(role, response.data.token);
                console.log(`${role} signed in successfully`);
                router.push(`/${role}`);
            }
        } catch (error) {
            console.error(`Error signing in as ${role}:`, error);
            if (axios.isAxiosError(error) && error.response?.status !== 400) {
            }
        } finally {
            setAuthenticating(false);
        }
    }, [role, connected, signMessage, isAuthenticating, getToken, setToken, publicKey, setAuthenticating, router]);

    useEffect(() => {
        if (connected && role !== "unsigned") {
            const existingToken = getToken(role);

            if (!existingToken && !hasAttemptedAuth.current) {
                hasAttemptedAuth.current = true;
                signIn();
            }
        }

        if (!connected) {
            hasAttemptedAuth.current = false;
            setAuthenticating(false);

            if (role !== "unsigned") {
                const token = getToken(role);
                if (token) {
                    removeToken(role);
                    console.log(`${role} token removed due to wallet disconnect`);
                    router.push('/');
                }
            }
        }
    }, [connected, role, getToken, removeToken, router, signIn]);


    const handlePayout = async () => {
        try {
            const response = await axios.post("/api/worker/payouts", {
            }, {
                headers: {
                    Authorization: `Bearer ${getToken("worker")}`
                }
            })
            console.log(response.data);
        } catch (error) {
            console.error("Error paying out:", error);
            alert("Error paying out. Please try again.");
        }
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Crowdmint
                            </span>
                        </Link>

                        {role === "user" && connected && (
                            <div className="hidden md:flex space-x-1">
                                <Link href="/user/tasks/create">
                                    <Button variant="ghost" size="sm">Create Task</Button>
                                </Link>
                                <Link href="/user/tasks">
                                    <Button variant="ghost" size="sm">View Tasks</Button>
                                </Link>
                            </div>
                        )}
                        {role === "worker" && connected && (
                            <div className="hidden md:flex space-x-1">
                                <Link href="/worker">
                                    <Button variant="ghost" size="sm">Home</Button>
                                </Link>
                                <Link href="/worker/task">
                                    <Button variant="ghost" size="sm">Next Task</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {role === "worker" && connected && (
                            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Pending</span>
                                    <span className="text-sm font-bold text-white">{pendingBalance / 1_000_000_000} SOL</span>
                                </div>
                                <div className="h-6 w-px bg-zinc-800"></div>
                                <button
                                    onClick={handlePayout}
                                    className="text-xs font-semibold text-white hover:text-zinc-300 transition-colors"
                                >
                                    Payout
                                </button>
                            </div>
                        )}

                        {!hideWallet && (
                            <div className="wallet-adapter-wrapper">
                                {connected ? (
                                    <WalletDisconnectButton className="!bg-zinc-900 !text-white !font-medium !rounded-lg !h-9 !px-4 !text-sm hover:!bg-zinc-800 transition-all border !border-zinc-800" />
                                ) : (
                                    <WalletMultiButton className="!bg-white !text-black !font-medium !rounded-lg !h-9 !px-4 !text-sm hover:!bg-zinc-200 transition-all" />
                                )}
                            </div>
                        )}

                        {role === "unsigned" && (
                            <Button
                                onClick={() => document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' })}
                                variant="primary"
                                size="sm"
                            >
                                Launch App
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-zinc-800 bg-background">
                {role === "user" && connected && (
                    <div className="px-4 py-3 space-y-2">
                        <Link href="/user/tasks/create" className="block">
                            <Button variant="ghost" className="w-full justify-start">Create Task</Button>
                        </Link>
                        <Link href="/user/tasks" className="block">
                            <Button variant="ghost" className="w-full justify-start">View Tasks</Button>
                        </Link>
                    </div>
                )}
                {role === "worker" && connected && (
                    <div className="px-4 py-3 space-y-2">
                        <Link href="/worker" className="block">
                            <Button variant="ghost" className="w-full justify-start">Home</Button>
                        </Link>
                        <Link href="/worker/task" className="block">
                            <Button variant="ghost" className="w-full justify-start">Next Task</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
