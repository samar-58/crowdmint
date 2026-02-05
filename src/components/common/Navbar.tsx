"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { useRole } from "@/contexts/RoleContext";

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

            const response = await api.post(`/api/${role}/signin`, {
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
            const response = await api.post("/api/worker/payouts", {});

            console.log("Payout successful:", response.data);

            if (onRefreshBalance) {
                onRefreshBalance();
            }

            alert(`Payout request successful! Amount: ${response.data.amount / 1_000_000_000} SOL`);
        } catch (error) {
            console.error("Error paying out:", error);
            if ((error as any).response) {
                alert((error as any).response?.data?.error || "Error paying out. Please try again.");
            } else {
                alert("Error paying out. Please try again.");
            }
        } finally {
            setIsPayingOut(false);
        }
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="font-bold text-xl">
                            CROWDMINT
                        </Link>

                        {role === "user" && connected && getToken("user") && (
                            <div className="hidden md:flex gap-1">
                                <Link href="/user/tasks/create" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                                    Create Task
                                </Link>
                                <Link href="/user/tasks" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                                    View Tasks
                                </Link>
                            </div>
                        )}
                        {role === "worker" && connected && getToken("worker") && (
                            <div className="hidden md:flex gap-1">
                                <Link href="/worker" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                                    Home
                                </Link>
                                <Link href="/worker/task" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                                    Next Task
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {role === "worker" && connected && getToken("worker") && (
                            <div className="flex items-center gap-4 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-400 font-medium uppercase">Pending</span>
                                    <span className="text-sm font-semibold text-zinc-900">{(pendingBalance / 1_000_000_000).toFixed(4)} SOL</span>
                                </div>
                                <div className="h-6 w-px bg-zinc-200"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-400 font-medium uppercase">Locked</span>
                                    <span className="text-sm font-semibold text-amber-600">{(lockedBalance / 1_000_000_000).toFixed(4)} SOL</span>
                                </div>
                                <div className="h-6 w-px bg-zinc-200"></div>
                                <button
                                    onClick={handlePayout}
                                    disabled={pendingBalance <= 0 || isPayingOut}
                                    className="text-xs font-medium text-zinc-900 hover:text-zinc-600 transition-colors disabled:text-zinc-300 disabled:cursor-not-allowed flex items-center gap-1.5"
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
                            <div className="hidden md:block wallet-adapter-wrapper">
                                {connected ? (
                                    <WalletDisconnectButton className="!bg-zinc-100 !text-zinc-900 !font-medium !rounded-lg !h-9 !px-4 !text-sm hover:!bg-zinc-200 transition-all !border !border-zinc-200" />
                                ) : (
                                    <WalletMultiButton className="!bg-zinc-900 !text-white !font-medium !rounded-lg !h-9 !px-4 !text-sm hover:!bg-zinc-800 transition-all" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-zinc-200 bg-white">
                {role === "user" && connected && getToken("user") && (
                    <div className="px-4 py-3 flex gap-2">
                        <Link href="/user/tasks/create" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900">
                            Create Task
                        </Link>
                        <Link href="/user/tasks" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900">
                            View Tasks
                        </Link>
                    </div>
                )}
                {role === "worker" && connected && getToken("worker") && (
                    <div className="px-4 py-3 flex gap-2">
                        <Link href="/worker" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900">
                            Home
                        </Link>
                        <Link href="/worker/task" className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900">
                            Next Task
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
