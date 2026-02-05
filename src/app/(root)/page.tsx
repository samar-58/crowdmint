"use client"

import { useRole } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { selectedRole, setSelectedRole, isLoading } = useRole();
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { getToken, isAuthenticating } = useAuthStore();

  const handleRoleSelect = (role: 'user' | 'worker') => {
    setSelectedRole(role);
    if (!connected) {
      setVisible(true);
    }
  };

  useEffect(() => {
    if (!isLoading && selectedRole !== 'unsigned' && connected) {
      const token = getToken(selectedRole as any);
      if (token) {
        router.push(`/${selectedRole}`);
      }
    }
  }, [selectedRole, connected, isLoading, router, getToken]);

  if (isLoading || isAuthenticating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-zinc-600 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Live on Solana Devnet
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            CROWDMINT
          </h1>

          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Crowdmint connects creators with a distributed workforce.
            Label data to earn SOL, or upload tasks to get authentic results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#roles"
              className="px-8 py-3.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
            >
              Learn More →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24 border-t border-zinc-100">
        <h2 className="text-2xl font-bold text-center mb-16">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Instant Payouts</h3>
            <p className="text-zinc-500 text-sm">Get paid in SOL immediately after task verification.</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Quality First</h3>
            <p className="text-zinc-500 text-sm">Consensus-based validation ensures accurate data.</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Web3 Native</h3>
            <p className="text-zinc-500 text-sm">Connect your wallet and start immediately.</p>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="roles" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold text-center mb-4">Choose Your Role</h2>
        <p className="text-zinc-500 text-center mb-12">Select how you want to use the platform</p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelect('user')}
            className="group text-left p-8 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all bg-white"
          >
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Creator</h3>
            <p className="text-zinc-500 mb-4">
              Upload data tasks and get them labeled by our distributed workforce.
            </p>
            <span className="text-sm font-medium text-zinc-900 group-hover:translate-x-1 inline-block transition-transform">
              Get Started →
            </span>
          </button>

          <button
            onClick={() => handleRoleSelect('worker')}
            className="group text-left p-8 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all bg-white"
          >
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Worker</h3>
            <p className="text-zinc-500 mb-4">
              Earn crypto by completing simple data labeling tasks.
            </p>
            <span className="text-sm font-medium text-zinc-900 group-hover:translate-x-1 inline-block transition-transform">
              Start Earning →
            </span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-sm">
          <p>© 2024 Crowdmint. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-zinc-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
