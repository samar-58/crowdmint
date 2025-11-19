"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore, type UserRole } from "@/store/authStore";

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
    const { publicKey, signMessage ,connected} = useWallet();
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
            const response = await axios.post("/api/worker/payouts",{
            },{
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

    // Use dark mode for landing page ("unsigned" role), light mode for app
    const isDarkMode = role === "unsigned";
    const bgColor = isDarkMode ? "bg-[#0F1117]/80 backdrop-blur-lg border-white/5" : "bg-white border-gray-200";
    const textColor = isDarkMode ? "text-white" : "text-gray-700";
    const borderColor = isDarkMode ? "border-white/5" : "border-gray-200";

    return (
        <nav className={`${bgColor} border-b sticky top-0 z-50 transition-all duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2 group"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                                <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Crowdmint
                            </span>
                        </Link>

                        {role === "user" && connected && (
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    href="/user/tasks/create"
                                    className={`${textColor} hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium`}
                                >
                                    Create Task
                                </Link>
                                <Link
                                    href="/user/tasks"
                                    className={`${textColor} hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium`}
                                >
                                    View Tasks
                                </Link>
                            </div>
                        )}
                        {role === "worker" && connected && (
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    href="/worker"
                                    className={`${textColor} hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all font-medium`}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/worker/task"
                                    className={`${textColor} hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all font-medium`}
                                >
                                    Next Task
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-5">
                        {role === "worker" && connected && (
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                                <div className="flex flex-col items-end">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                                    <p className="text-sm font-bold text-gray-900">{pendingBalance / 1_000_000_000} SOL</p>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <button 
                                    onClick={handlePayout} 
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Payout
                                </button>
                            </div>
                        )}
                        
                        {!hideWallet && (
                            connected ? (
                                <WalletDisconnectButton />
                            ) : (
                                <WalletMultiButton />
                            )
                        )}
                        
                        {role === "unsigned" && (
                             <button 
                                onClick={() => document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-5 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors text-sm"
                             >
                                Launch App
                             </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden border-t ${borderColor} ${isDarkMode ? 'bg-[#0F1117]' : 'bg-white'}`}>
                {role === "user" && connected && (
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            href="/user/tasks/create"
                            className={`block ${textColor} hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium`}
                        >
                            Create Task
                        </Link>
                        <Link
                            href="/user/tasks"
                            className={`block ${textColor} hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium`}
                        >
                            View Tasks
                        </Link>
                    </div>
                )}
                {role === "worker" && connected && (
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            href="/worker"
                            className={`block ${textColor} hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all font-medium`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/worker/task"
                            className={`block ${textColor} hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all font-medium`}
                        >
                            Next Task
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
