"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton, WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuthStore, type UserRole } from "@/store/authStore";

export default function Navbar({role}: {role: UserRole | "unsigned"}): React.ReactNode{
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
    
    const signIn = async () => {
        if (role === "unsigned" || !connected || !signMessage || isAuthenticating) {
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
                router.refresh();
            }
        } catch (error) {
            console.error(`Error signing in as ${role}:`, error);
            if (axios.isAxiosError(error) && error.response?.status !== 400) {
            }
        } finally {
            setAuthenticating(false);
        }
    };
    
    useEffect(() => {
        if (connected && !hasAttemptedAuth.current && role !== "unsigned") {
            hasAttemptedAuth.current = true;
            signIn();
        }
        
        if (!connected) {
            hasAttemptedAuth.current = false;
            setAuthenticating(false);
        }
    }, [connected, role]);
    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Crowdmint
                        </Link>
                        {role === "user" && (
                            <>
                        <div className="hidden md:flex space-x-1">
                            <Link
                                href="/user/tasks/create"
                                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                            >
                                Create Task
                            </Link>
                            <Link
                                href="/user/tasks"
                                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                            >
                                View Tasks
                            </Link>
                        </div>
                        </>
                        )}
                    </div>

                    {/* Connect Wallet Button */}
                    {/* <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium">
                        Connect Wallet
                    </button> */}
                    {connected ? (
                        <WalletDisconnectButton />
                    ) : (
                        <WalletMultiButton />
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 bg-white">
                {role === "user" && (
                <>
                <div className="px-4 py-3 space-y-1">
                    <Link
                        href="/"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                    >
                        Create Task
                    </Link>
                    <Link
                        href="/user/tasks"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                    >
                        View Tasks
                    </Link>
                </div>
                </>
                )}
            </div>
        </nav>
    );
}