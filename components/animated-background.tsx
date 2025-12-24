"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  color: string
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      const colors = ["oklch(0.65 0.25 270)", "oklch(0.72 0.28 40)"]

      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 5,
          duration: Math.random() * 10 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="animated-bg">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="bg-particle animate-twinkle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Large soft blurs in background */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-drift"
        style={{
          background: "oklch(0.65 0.25 270)",
          top: "10%",
          left: "10%",
          animationDuration: "20s",
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-15 animate-drift"
        style={{
          background: "oklch(0.72 0.28 40)",
          bottom: "10%",
          right: "10%",
          animationDelay: "2s",
          animationDuration: "25s",
        }}
      />
    </div>
  )
}
