// src/sections/Hero.jsx
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Particles from 'react-tsparticles'
import { loadSlim } from '@tsparticles/slim'

gsap.registerPlugin(ScrollTrigger)

const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setReduce(!!mq.matches)
    set()
    mq.addEventListener ? mq.addEventListener('change', set) : mq.addListener(set)
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', set) : mq.removeListener(set)
    }
  }, [])
  return reduce
}

const useIsMobile = () => {
  const [m, setM] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const on = () => setM(window.innerWidth < 768)
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

export default function Hero() {
  const containerRef = useRef(null)
  const visualRef = useRef(null)
  const cardRef = useRef(null)
  const orbsRef = useRef([])
  const [init, setInit] = useState(false)
  const reduce = usePrefersReducedMotion()
  const isMobile = useIsMobile()

  const enableParticles = useMemo(() => {
    const vite = import.meta?.env?.VITE_ENABLE_PARTICLES
    const reactEnv = import.meta?.env?.REACT_APP_ENABLE_PARTICLES || undefined
    const value = vite ?? reactEnv
    const enabled = value === undefined ? true : String(value).toLowerCase() !== 'false'
    return enabled && !isMobile && !reduce
  }, [reduce, isMobile])

  // particles init callback for react-tsparticles
  const particlesInit = useCallback(async (engine) => {
    try {
      await loadSlim(engine)
      setInit(true)
    } catch (err) {
      console.error('Error loading tsParticles slim bundle', err)
    }
  }, [])

  // Entrance GSAP timeline for right visuals
  useLayoutEffect(() => {
    if (!visualRef.current || reduce) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.hero-visual .layer', { y: 20, autoAlpha: 0, scale: 0.96, stagger: 0.08, duration: 0.5 })
      tl.to(cardRef.current, { y: -6, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // Parallax with ScrollTrigger
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        gsap.to('.hero-visual .parallax-slow', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
        gsap.to('.hero-visual .parallax-fast', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      })
    }, visualRef)
    return () => ctx.revert()
  }, [reduce])

  // Pointer parallax
  useEffect(() => {
    if (!visualRef.current || reduce) return
    let raf = 0
    let px = 0,
      py = 0
    const el = visualRef.current
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      px = x
      py = y
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const tick = () => {
      raf = 0
      if (cardRef.current) {
        gsap.to(cardRef.current, { rotateX: py * 6, rotateY: -px * 6, transformPerspective: 800, duration: 0.5 })
      }
      if (orbsRef.current) {
        gsap.to(orbsRef.current, { x: px * 14, y: py * 14, duration: 0.6, stagger: 0.04, ease: 'power2.out' })
      }
    }
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduce])

  const title = 'I build fast, beautiful web experiences — production-ready UI & delightful UX.'

  return (
    <section id="home" ref={containerRef} className="relative overflow-hidden">
      {/* Particles Background */}
      {enableParticles && (
        <Particles id="tsparticles" className="particles-canvas" init={particlesInit} options={particleOptions} />
      )}

      <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-24 md:pt-32 pb-16 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left: Text */}
          <div className="text-left">
            <RolePill />
            <HeadingReveal text={title} />
            <p className="mt-5 text-white/70 max-w-xl">Shipping reliable frontends that scale — performance-minded, design-led.</p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#work"
                className="btn-shimmer inline-flex items-center rounded-md bg-accent-neon text-[#071028] font-semibold px-5 py-3 shadow-neon hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                View Work
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-md border border-white/15 px-5 py-3 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Hire Me
              </a>
            </div>
          </div>

          {/* Right: Visual Composition */}
          <div ref={visualRef} className="hero-visual relative h-[420px] md:h-[520px]">
            {/* Soft glass blobs */}
            <div className="parallax-slow layer absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/6 blur-2xl" />
            <div className="parallax-slow layer absolute top-24 -right-10 w-40 h-40 rounded-full bg-accent-neon/10 blur-2xl" />
            {/* Neon rings */}
            <div className="parallax-fast layer absolute -right-8 top-4 w-60 h-60 rounded-full border border-accent-neon/60" />

            {/* Floating Card */}
            <motion.div
              ref={cardRef}
              className="layer relative mx-auto w-[85%] max-w-sm aspect-[5/3] rounded-2xl bg-gradient-to-br from-[#0b1a2b] to-[#061326] border border-white/10 shadow-glass overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <div className="absolute inset-0 opacity-[0.92] bg-[radial-gradient(120%_120%_at_10%_10%,rgba(0,245,255,.2),rgba(255,107,107,.08)_40%,transparent_70%)]" />
              {/* Mock content */}
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff6b6b]" />
                  <span className="w-2 h-2 rounded-full bg-[#ffd166]" />
                  <span className="w-2 h-2 rounded-full bg-[#06d6a0]" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-white/15" />
                  <div className="h-3 w-3/6 rounded bg-white/10" />
                  <div className="h-3 w-4/6 rounded bg-white/15" />
                </div>
              </div>
              {/* Floor shadow */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-[100%] bg-[radial-gradient(closest-side,rgba(0,0,0,.35),transparent)]"
                aria-hidden
              />
            </motion.div>

            {/* Floating Neon Orbs */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                ref={(el) => (orbsRef.current[i] = el)}
                className={`layer absolute w-8 h-8 rounded-full ${i % 3 === 0 ? 'bg-[#ff6b6b]' : 'bg-[#00f5ff]'} blur-sm opacity-80`}
                style={{ top: ['12%', '70%', '40%', '8%'][i], left: ['8%', '72%', '52%', '86%'][i] }}
              />
            ))}
          </div>{' '}
          {/* ✅ close hero-visual */}
        </div>{' '}
        {/* ✅ close grid */}
      </div>{' '}
      {/* ✅ close container */}
    </section>
  )
}

function RolePill() {
  return (
    <motion.span
      className="inline-flex items-center gap-2 text-[12px] font-medium px-3 py-1 rounded-full border border-accent-neon/40 bg-white/5 text-white/80 shadow-neon/20"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent-neon shadow-[0_0_16px_rgba(0,245,255,.7)]" />
      Frontend • UI Engineer
    </motion.span>
  )
}

function HeadingReveal({ text }) {
  const words = text.split(' ')
  const variants = {
    hidden: { y: '100%' },
    show: (i) => ({ y: 0, transition: { delay: 0.06 * i, type: 'spring', stiffness: 400, damping: 28 } }),
  }
  return (
    <h1 className="mt-5 text-3xl md:text-5xl font-heading font-extrabold leading-tight tracking-tight">
      {words.map((w, i) => (
        <span className="word-clip" key={i}>
          <motion.span custom={i} variants={variants} initial="hidden" animate="show" className="inline-block mr-1">
            <span className={w.toLowerCase().includes('fast') || w.toLowerCase().includes('ui') ? 'relative' : ''}>
              {w}
              {(w.toLowerCase().includes('fast') || w.toLowerCase().includes('ui')) && (
                <motion.span
                  className="absolute left-0 right-0 -bottom-1 h-1 bg-accent-neon/80 rounded"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.06 * i + 0.2, type: 'spring', stiffness: 300, damping: 24 }}
                />
              )}
            </span>
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

const particleOptions = {
  fpsLimit: 60,
  fullScreen: { enable: false },
  background: { color: 'transparent' },
  detectRetina: true,
  particles: {
    number: { value: 60, density: { enable: true, area: 800 } },
    color: { value: ['#00f5ff', '#00f5ff', '#00f5ff', '#ff6b6b'] },
    shape: { type: 'circle' },
    opacity: { value: 0.45 },
    size: { value: { min: 1, max: 2.6 } },
    links: { enable: false },
    move: {
      enable: true,
      speed: 0.6,
      direction: 'none',
      outModes: 'out',
      attract: { enable: false },
      decay: 0.0,
    },
  },
  interactivity: {
    detectsOn: 'window',
    events: {
      onHover: { enable: true, mode: 'repulse' },
      resize: true,
    },
    modes: {
      repulse: { distance: 90, duration: 0.6 },
    },
  },
}
