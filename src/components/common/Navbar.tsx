"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRole } from "@/contexts/RoleContext";
import { Logo } from "@/components/common/Logo";

export default function Navbar({
    role,
    pendingBalance,
    lockedBalance,
    hideWallet = false,
    onRefreshBalance
}: {
    role: UserRole | "unsigned",
    pendingBalance: number,
    lockedBalance: number,
    hideWallet?: boolean,
    onRefreshBalance?: () => void
}): React.ReactNode {
    const { publicKey, signMessage, connected } = useWallet();
    const router = useRouter();
    const hasAttemptedAuth = useRef(false);
    const [isPayingOut, setIsPayingOut] = useState(false);
    const { setSelectedRole } = useRole();

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
                setSelectedRole(role as any);
                router.push(`/${role}`);
            }
        } catch (error) {
            console.error(`Error signing in as ${role}:`, error);
            if (axios.isAxiosError(error) && error.response?.status !== 400) {
            }
        } finally {
            setAuthenticating(false);
        }
    }, [role, connected, signMessage, isAuthenticating, getToken, setToken, publicKey, setAuthenticating, router, setSelectedRole]);

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
        if (isPayingOut || pendingBalance <= 0) return;

        setIsPayingOut(true);
        try {
            const response = await axios.post("/api/worker/payouts", {}, {
                headers: {
                    Authorization: `Bearer ${getToken("worker")}`
                }
            });

            console.log("Payout successful:", response.data);

            if (onRefreshBalance) {
                onRefreshBalance();
            }

            alert(`Payout request successful! Amount: ${response.data.amount / 1_000_000_000} SOL`);
        } catch (error) {
            console.error("Error paying out:", error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.error || "Error paying out. Please try again.");
            } else {
                alert("Error paying out. Please try again.");
            }
        } finally {
            setIsPayingOut(false);
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
                            <Logo className="h-14 w-auto" />
                        </Link>

                        {role === "user" && connected && getToken("user") && (
                            <div className="hidden md:flex space-x-1">
                                <Link href="/user/tasks/create">
                                    <Button variant="ghost" size="sm">Create Task</Button>
                                </Link>
                                <Link href="/user/tasks">
                                    <Button variant="ghost" size="sm">View Tasks</Button>
                                </Link>
                            </div>
                        )}
                        {role === "worker" && connected && getToken("worker") && (
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
                        {role === "worker" && connected && getToken("worker") && (
                            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Pending</span>
                                    <span className="text-sm font-bold text-white">{(pendingBalance / 1_000_000_000).toFixed(4)} SOL</span>
                                </div>
                                <div className="h-6 w-px bg-zinc-800"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Locked</span>
                                    <span className="text-sm font-bold text-amber-400">{(lockedBalance / 1_000_000_000).toFixed(4)} SOL</span>
                                </div>
                                <div className="h-6 w-px bg-zinc-800"></div>
                                <button
                                    onClick={handlePayout}
                                    disabled={pendingBalance <= 0 || isPayingOut}
                                    className="text-xs font-semibold text-white hover:text-zinc-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {isPayingOut ? (
                                        <>
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        "Payout"
                                    )}
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
                {role === "user" && connected && getToken("user") && (
                    <div className="px-4 py-3 space-y-2">
                        <Link href="/user/tasks/create" className="block">
                            <Button variant="ghost" className="w-full justify-start">Create Task</Button>
                        </Link>
                        <Link href="/user/tasks" className="block">
                            <Button variant="ghost" className="w-full justify-start">View Tasks</Button>
                        </Link>
                    </div>
                )}
                {role === "worker" && connected && getToken("worker") && (
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
