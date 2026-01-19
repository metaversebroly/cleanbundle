import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  animate?: boolean
  delay?: number
}

export function GlassCard({ 
  children, 
  className = '', 
  hover = false,
  animate = true,
  delay = 0
}: GlassCardProps) {
  const baseClasses = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300"
  const hoverClasses = hover ? "hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10" : ""

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`${baseClasses} ${hoverClasses} ${className}`}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
