"use client"
import Navbar from "@/components/common/Navbar";
import { useRole } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navigation */}
      <Navbar role="unsigned" pendingBalance={0} lockedBalance={0} hideWallet={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live on Solana Devnet
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
            Decentralized Data Labeling
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crowdmint connects AI creators with a distributed workforce.
            Label data to earn SOL, or upload tasks to train your models faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToRoles}
              size="lg"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Start Earning
            </Button>
            <Button
              onClick={scrollToRoles}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Create Task
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-y border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Instant Payouts",
                desc: "Get paid in SOL immediately after task verification. No minimum thresholds.",
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Quality First",
                desc: "Consensus-based validation ensures high-quality data for your AI models.",
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Web3 Native",
                desc: "Fully decentralized workflow. Connect your wallet and start immediately.",
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <Card key={i} hoverEffect className="bg-zinc-900/50 border-zinc-800">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles-section" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Choose Your Path</h2>
            <p className="text-zinc-400">Select how you want to interact with the protocol</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Creator Card */}
            <button
              onClick={() => setSelectedRole('user')}
              className="group text-left"
            >
              <Card hoverEffect className="h-full bg-zinc-900/30 border-zinc-800 group-hover:border-zinc-700 transition-colors">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white">I'm a Creator</h3>
                <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                  Upload data tasks and get them labeled by our distributed workforce. Fast, accurate, and cost-effective.
                </p>

                <div className="flex items-center text-white text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Get Started <span className="ml-2">→</span>
                </div>
              </Card>
            </button>

            {/* Worker Card */}
            <button
              onClick={() => setSelectedRole('worker')}
              className="group text-left"
            >
              <Card hoverEffect className="h-full bg-zinc-900/30 border-zinc-800 group-hover:border-zinc-700 transition-colors">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white">I'm a Worker</h3>
                <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                  Earn crypto by completing simple data labeling tasks. Flexible work, instant payouts.
                </p>

                <div className="flex items-center text-white text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start Earning <span className="ml-2">→</span>
                </div>
              </Card>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-background">
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
