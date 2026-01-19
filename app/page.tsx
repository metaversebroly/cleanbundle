'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Target, Sparkles, BarChart3, ArrowRight, Check } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

export default function Home() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Professional Solana Bundle Analysis</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Clean Your Solana
              </span>
              <br />
              <span className="text-white">Bundles Like a Pro</span>
              <span className="inline-block ml-4">🛠️</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Stop getting flagged. Launch with confidence.
              <br />
              Professional bundle analysis for Solana devs and launchers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/analyze">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    🚀 Analyze Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
              <Link href="/analyze">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  📖 Learn More
                </motion.button>
              </Link>
            </div>

            {/* Animated Mockup */}
            <motion.div
              style={{ y: y1 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-glow-pulse">
                  {/* Mockup Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-sm text-gray-500">CleanBundle Analyzer</div>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600"></div>
                          <div>
                            <div className="h-3 w-32 bg-gray-700 rounded"></div>
                            <div className="h-2 w-24 bg-gray-800 rounded mt-2"></div>
                          </div>
                        </div>
                        <div className="text-green-400 font-semibold">🟢 85</div>
                      </div>
                      <div className="flex items-center justify-between opacity-70">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
                          <div>
                            <div className="h-3 w-28 bg-gray-700 rounded"></div>
                            <div className="h-2 w-20 bg-gray-800 rounded mt-2"></div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-semibold">🟡 67</div>
                      </div>
                      <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-red-600"></div>
                          <div>
                            <div className="h-3 w-36 bg-gray-700 rounded"></div>
                            <div className="h-2 w-28 bg-gray-800 rounded mt-2"></div>
                          </div>
                        </div>
                        <div className="text-red-400 font-semibold">🔴 42</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500 text-sm flex flex-col items-center gap-2"
          >
            <span>Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"
              ></motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Launch Clean
              </span>
            </h2>
            <p className="text-xl text-gray-400">Professional tools for serious launchers</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1: Analyze */}
            <FeatureCard
              icon={<Target className="w-12 h-12" />}
              title="Analyze"
              description="Check bundle health, detect risks, and get actionable insights before launch."
              delay={0.1}
              available={true}
            />

            {/* Feature Card 2: Clean */}
            <FeatureCard
              icon={<Sparkles className="w-12 h-12" />}
              title="Clean"
              description="Close empty accounts, reclaim rent, and optimize your wallet for maximum efficiency."
              delay={0.2}
              available={false}
            />

            {/* Feature Card 3: Optimize */}
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12" />}
              title="Optimize"
              description="Get personalized recommendations to maximize your launch readiness score."
              delay={0.3}
              available={false}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Final CTA */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Launch Clean?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join hundreds of devs who trust CleanBundle for their launches
            </p>
            <Link href="/analyze">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Start Analyzing
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500">
              Made with ❤️ for the Solana community
            </div>
            <div className="flex gap-6 text-gray-500">
              <Link href="/analyze" className="hover:text-purple-400 transition-colors">
                Analyzer
              </Link>
              <a href="https://twitter.com/metaversebroly" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                Twitter
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay, available }: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
  available: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-white/20 transition-all duration-300">
        <div className="text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          {title}
          {available && <Check className="w-5 h-5 text-green-400" />}
          {!available && <span className="text-xs text-gray-500 font-normal">(Coming Soon)</span>}
        </h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        {available && (
          <Link href="/analyze">
            <motion.button
              whileHover={{ x: 5 }}
              className="mt-6 text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2"
            >
              Try it now <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// Stats Section Component
function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative py-32 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <StatCounter
            end={2547}
            label="Wallets Analyzed"
            suffix=""
            isVisible={isVisible}
          />
          <StatCounter
            end={156}
            label="Bundles Cleaned"
            suffix=""
            isVisible={isVisible}
          />
          <StatCounter
            end={99.2}
            label="Success Rate"
            suffix="%"
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  )
}

// Stat Counter Component
function StatCounter({ end, label, suffix, isVisible }: {
  end: number
  label: string
  suffix: string
  isVisible: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = end / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current * 10) / 10) // Round to 1 decimal
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [end, isVisible])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xl text-gray-400">{label}</div>
    </motion.div>
  )
}
