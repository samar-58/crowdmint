'use client';

import "@/app/globals.css";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import {  WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

import '@solana/wallet-adapter-react-ui/styles.css';
import Navbar from "@/components/common/Navbar";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { useNextTask } from "@/hooks/useTask";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { selectedRole } = useRole();
    const { data, refetch } = useNextTask(selectedRole === 'worker');

    const pendingBalance = data?.pendingBalance ?? 0;
    const lockedBalance = data?.lockedBalance ?? 0;
    
    return (
        <>
            <Navbar 
                role={selectedRole} 
                pendingBalance={pendingBalance} 
                lockedBalance={lockedBalance}
                onRefreshBalance={refetch}
            />
            {children}
        </>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [], [network]);
    
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <RoleProvider>
                        <LayoutContent>
                            {children}
                        </LayoutContent>
                    </RoleProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
