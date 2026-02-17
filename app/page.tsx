'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Bot, Workflow, Shield, Users, TrendingUp, Code, Rocket, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Hero3D } from '@/components/3d/Hero3D';

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set(prev).add(index));
            }
          });
        },
        { threshold: 0.2 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div className="w-full bg-slate-900">
      {/* Hero Section with 3D Background */}
      <section className="relative min-h-screen w-full">
        {/* 3D Background */}
        <div className="absolute inset-0 overflow-hidden">
          <Hero3D />
        </div>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="animate-fade-in">
              <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 backdrop-blur-sm px-6 py-3 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Generation AI Platform
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in-up leading-tight">
              Welcome to the
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Future of AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
              Harness the power of intelligent automation with our cutting-edge AI agents.
              Transform your workflow and unlock limitless possibilities.
            </p>

            {/* CTA Button */}
            <div className="animate-fade-in-up animation-delay-400">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-12 py-8 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 border-2 border-purple-400/30"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Enter Dashboard
                    <ArrowRight 
                      className={`w-6 h-6 transition-transform duration-300 ${
                        isHovered ? 'translate-x-2' : ''
                      }`} 
                    />
                  </span>
                  
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 pt-8 animate-fade-in-up animation-delay-600">
              {['AI-Powered', 'Real-Time Processing', 'Secure & Scalable'].map((feature, index) => (
                <div
                  key={index}
                  className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 cursor-default"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full animate-scroll" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section 
        ref={(el) => { sectionRefs.current[0] = el; }}
        className={`relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-1000 ${
          visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-6">
              <Workflow className="w-4 h-4 mr-2" />
              What We Do
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI Agent Hub
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your central platform for discovering, running, and creating powerful AI-powered workflows built with n8n
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: 'Discover Agents',
                description: 'Browse our extensive library of pre-built AI agents for every use case - from content generation to data analysis.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Zap,
                title: 'Run Instantly',
                description: 'Execute powerful workflows with a single click. No setup, no configuration - just instant results.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Code,
                title: 'Create & Share',
                description: 'Build your own AI agents using n8n workflows and share them with the community.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={(el) => { sectionRefs.current[1] = el; }}
        className={`relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 to-slate-900 transition-all duration-1000 ${
          visibleSections.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-6">
              <Star className="w-4 h-4 mr-2" />
              Key Features
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for developers, designed for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: Workflow,
                title: 'n8n Integration',
                description: 'Seamlessly import and run n8n workflows. Connect to hundreds of services and APIs with ease.',
                features: ['Visual workflow editor', 'API integrations', 'Custom nodes support']
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Your data is protected with industry-leading security standards and encryption.',
                features: ['End-to-end encryption', 'SOC 2 compliant', 'Regular security audits']
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Join thousands of developers sharing and improving AI workflows together.',
                features: ['Open marketplace', 'Community support', 'Regular updates']
              },
              {
                icon: Rocket,
                title: 'Lightning Fast',
                description: 'Optimized infrastructure ensures your workflows run at maximum speed.',
                features: ['Global CDN', 'Auto-scaling', '99.9% uptime']
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={(el) => { sectionRefs.current[2] = el; }}
        className={`relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 transition-all duration-1000 ${
          visibleSections.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'AI Agents', icon: Bot },
              { value: '10K+', label: 'Active Users', icon: Users },
              { value: '50K+', label: 'Workflows Run', icon: Zap },
              { value: '99.9%', label: 'Uptime', icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-purple-200 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={(el) => { sectionRefs.current[3] = el; }}
        className={`relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-1000 ${
          visibleSections.has(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three simple steps to automate your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Discover',
                description: 'Explore our marketplace of AI agents. Filter by category, popularity, or search for specific use cases.',
                icon: Bot
              },
              {
                step: '02',
                title: 'Configure & Run',
                description: 'Select an agent, provide your input parameters, and execute the workflow with a single click.',
                icon: Zap
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive instant results powered by AI. Download, share, or integrate into your existing tools.',
                icon: CheckCircle2
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 h-full">
                  <div className="text-6xl font-bold text-purple-500/20 mb-4">{step.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-purple-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={(el) => { sectionRefs.current[4] = el; }}
        className={`relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 to-slate-900 transition-all duration-1000 ${
          visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of users who are already automating their tasks with AI-powered agents
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
            </Link>
            <Link href="/agents">
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-purple-500/50 text-black bg-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <Bot className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Explore Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(12px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
