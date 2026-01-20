"use client"

import { useRole } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Scene from "@/components/landing/Scene";
import { motion, Variants } from "framer-motion";
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

  const scrollToRoles = () => {
    document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || isAuthenticating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-white/20 animate-spin-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-medium tracking-wide">Authenticating</p>
            <p className="text-zinc-500 text-sm">Please sign the message in your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Scene />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-sm font-medium mb-8 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live on Solana Devnet
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-9xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10 drop-shadow-2xl"
            style={{ lineHeight: 0.9 }}
          >
            CROWD<span className="text-indigo-500">MINT</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Bradman connects creators with a distributed workforce.
            <span className="text-white font-medium"> Label data to earn SOL</span>, or upload tasks to get authentic results.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              onClick={scrollToRoles}
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 border-0 text-lg px-10 py-8 rounded-full font-bold transition-transform hover:scale-105"
            >
              Start Earning
            </Button>
            <Button
              onClick={scrollToRoles}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white text-lg px-10 py-8 rounded-full transition-transform hover:scale-105"
            >
              Create Task
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {[
              {
                title: "Instant Payouts",
                desc: "Get paid in SOL immediately after task verification. No minimum thresholds.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Quality First",
                desc: "Consensus-based validation ensures high-quality data for your AI models.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Web3 Native",
                desc: "Fully decentralized workflow. Connect your wallet and start immediately.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles-section" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Choose Your Path</h2>
            <p className="text-xl text-zinc-400">Select how you want to interact with the protocol</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Creator Card */}
            <motion.button
              onClick={() => handleRoleSelect('user')}
              className="group text-left relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-300"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-10">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white">I'm a Creator</h3>
                <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                  Upload data tasks and get them labeled by our distributed workforce. Fast, accurate, and cost-effective.
                </p>

                <div className="flex items-center text-white text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Get Started <span className="ml-2">→</span>
                </div>
              </div>
            </motion.button>

            {/* Worker Card */}
            <motion.button
              onClick={() => handleRoleSelect('worker')}
              className="group text-left relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-300"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-10">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white">I'm a Worker</h3>
                <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                  Earn crypto by completing simple data labeling tasks. Flexible work, instant payouts.
                </p>

                <div className="flex items-center text-white text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Start Earning <span className="ml-2">→</span>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm">
          <p>&copy; 2024 Crowdmint. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
