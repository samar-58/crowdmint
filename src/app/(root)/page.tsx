"use client"
import Navbar from "@/components/common/Navbar";
import { useRole } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { selectedRole, setSelectedRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (selectedRole === 'user') {
      router.push('/user');
    } else if (selectedRole === 'worker') {
      router.push('/worker');
    }
  }, [selectedRole, router]);

  const scrollToRoles = () => {
    document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Don't show content if redirecting
  if (selectedRole !== 'unsigned') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar role="unsigned" pendingBalance={0} lockedBalance={0} hideWallet={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live on Solana Devnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
            Decentralized Data Labeling <br />
            <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powered by Crypto
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Crowdmint connects AI creators with a distributed workforce. 
            Label data to earn SOL, or upload tasks to train your models faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={scrollToRoles}
              className="px-8 py-4 rounded-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              Start Earning
            </button>
            <button 
              onClick={scrollToRoles}
              className="px-8 py-4 rounded-full bg-[#1A1D26] hover:bg-[#20242F] border border-white/5 text-gray-300 font-medium text-lg transition-all"
            >
              Create Task
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#0A0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Instant Payouts",
                desc: "Get paid in SOL immediately after task verification. No minimum thresholds.",
                icon: (
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Quality First",
                desc: "Consensus-based validation ensures high-quality data for your AI models.",
                icon: (
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Web3 Native",
                desc: "Fully decentralized workflow. Connect your wallet and start immediately.",
                icon: (
                  <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#151921] border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles-section" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-gray-400">Select how you want to interact with the protocol</p>
        </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Creator Card */}
          <button
            onClick={() => setSelectedRole('user')}
              className="group relative p-1 rounded-3xl bg-linear-to-b from-white/10 to-white/5 hover:from-blue-500 hover:to-purple-600 transition-all duration-300"
            >
              <div className="relative h-full bg-[#0F1117] rounded-[22px] p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                
                <div className="relative z-10 text-left">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">I'm a Creator</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Upload data tasks and get them labeled by our distributed workforce. Fast, accurate, and cost-effective.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                      Create labeling tasks
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                      Pay in SOL
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                      Export validated datasets
                  </li>
              </ul>

                  <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Get Started <span className="ml-2">→</span>
                  </div>
                </div>
            </div>
          </button>

          {/* Worker Card */}
          <button
            onClick={() => setSelectedRole('worker')}
              className="group relative p-1 rounded-3xl bg-linear-to-b from-white/10 to-white/5 hover:from-purple-500 hover:to-pink-600 transition-all duration-300"
            >
              <div className="relative h-full bg-[#0F1117] rounded-[22px] p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                
                <div className="relative z-10 text-left">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">I'm a Worker</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Earn crypto by completing simple data labeling tasks. Flexible work, instant payouts.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3" />
                      Earn SOL for tasks
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3" />
                      Instant withdrawals
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3" />
                      Work from anywhere
                  </li>
              </ul>

                  <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Start Earning <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#0A0C10]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>&copy; 2024 Crowdmint. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
