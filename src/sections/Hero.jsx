import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Particles, { initParticlesEngine } from 'react-tsparticles'
import { loadSlim } from '@tsparticles/slim'
import useRafThrottle from '../utils/useRafThrottle'

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
    on();
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

export default function Hero() {
  const containerRef = useRef(null)
  const visualRef = useRef(null)
  const cardRef = useRef(null)
  const ringPathRef = useRef(null)
  const orbsRef = useRef([])
  const [init, setInit] = useState(false)
  const reduce = usePrefersReducedMotion()
  const isMobile = useIsMobile()

  const PARALLAX_M = useMemo(() => {
    const raw = parseFloat(import.meta?.env?.VITE_PARALLAX_MULTIPLIER)
    return Number.isFinite(raw) ? raw : 1
  }, [])

  const enableParticles = useMemo(() => {
    const vite = import.meta?.env?.VITE_ENABLE_PARTICLES
    const react = import.meta?.env?.REACT_APP_ENABLE_PARTICLES || undefined
    const value = (vite ?? react)
    const enabled = value === undefined ? true : String(value).toLowerCase() !== 'false'
    return enabled && !isMobile && !reduce
  }, [reduce, isMobile])

  useEffect(() => {
    let ignore = false
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      if (!ignore) setInit(true)
    })
    return () => { ignore = true }
  }, [])

  // Entrance + scroll parallax timeline
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const scrubVal = reduce ? 0.1 : 0.6

      // 1) Headline reveal (GSAP, with Framer fallback if reduced)
      if (!reduce) {
        gsap.from('.hero-title .word-clip > *', {
          yPercent: 100,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.045,
          force3D: true,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            once: true,
          }
        })
      }

      // 2) Visual entrance pieces
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      if (!reduce) {
        tl.from('.hero-visual .blob', { y: 20, autoAlpha: 0, scale: 0.96, stagger: 0.08, duration: 0.5 })
          .from(cardRef.current, { y: 24, autoAlpha: 0, scale: 0.92, duration: 0.5 }, '-=0.25')
          .fromTo(ringPathRef.current, { strokeDasharray: 560, strokeDashoffset: 560 }, { strokeDashoffset: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.3')
      }

      // 3) Idle float on card
      if (!reduce && cardRef.current) {
        gsap.to(cardRef.current, { y: -6, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      }

      // 4) Scroll parallax (scrubbed)
      // Background gradient slow offset
      gsap.to(containerRef.current, {
        backgroundPositionY: '5%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: scrubVal,
        }
      })

      // Blobs (slow)
      gsap.to('.hero-visual .parallax-slow', {
        x: 8 * PARALLAX_M,
        y: 14 * PARALLAX_M,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: scrubVal,
        }
      })

      // Orbs (faster, with gentle scale)
      gsap.to('.hero-visual .parallax-fast', {
        x: -14 * PARALLAX_M,
        y: -18 * PARALLAX_M,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: scrubVal,
        }
      })

      // Card subtle depth
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          y: -6 * PARALLAX_M,
          rotateZ: -0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom top',
            scrub: scrubVal,
          }
        })
      }
    }, containerRef)
    return () => ctx.revert()
  }, [reduce])

  // Pointer parallax with RAF throttle + quickSetter
  useEffect(() => {
    if (!visualRef.current || reduce || isMobile) return

    const el = visualRef.current
    const card = cardRef.current
    const orbs = orbsRef.current.filter(Boolean)

    const setCard = gsap.quickSetter(card, 'transform')
    const setters = orbs.map((o) => gsap.quickSetter(o, 'x,y'))

    let rect = el.getBoundingClientRect()
    const onResize = () => { rect = el.getBoundingClientRect() }
    window.addEventListener('resize', onResize)

    const handler = (e) => {
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      const tx = x * (16 * PARALLAX_M)
      const ty = y * (12 * PARALLAX_M)
      const rx = y * 6
      const ry = -x * 6
      setCard(`translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) perspective(800px)`)
      setters.forEach((s, i) => s({ x: x * (12 + i * 2), y: y * (12 + i * 2) }))
    }

    const onMove = useRafThrottle(handler)

    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [reduce, isMobile])

  const title = 'I build fast, beautiful web experiences — production-ready UI & delightful UX.'

  return (
    <section id="home" ref={containerRef} className="relative overflow-hidden bg-hero bg-[length:120%_120%]">
      {/* Particles Background */}
      {enableParticles && init && (
        <Particles id="tsparticles" className="particles-canvas" options={particleOptions} />
      )}

      <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-24 md:pt-32 pb-16 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left: Text */}
          <div className="text-left">
            <RolePill />
            <HeadingReveal text={title} reduced={reduce} />
            <p className="mt-5 text-white/70 max-w-xl">Shipping reliable frontends that scale — performance-minded, design-led.</p>
            <div className="mt-8 flex items-center gap-4">
              <motion.a whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} href="#work" className="btn-shimmer inline-flex items-center rounded-md bg-accent-neon text-[#071028] font-semibold px-5 py-3 shadow-neon hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                View Work
              </motion.a>
              <motion.a whileTap={{ scale: 0.98 }} href="#contact" className="inline-flex items-center rounded-md border border-white/15 px-5 py-3 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                Hire Me
              </motion.a>
            </div>
          </div>

          {/* Right: Visual Composition */}
          <div ref={visualRef} className="hero-visual relative h-[420px] md:h-[520px] preserve-3d will-transform">
            {/* Soft glass blobs */}
            <div className="parallax-slow blob layer absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/6 blur-2xl" />
            <div className="parallax-slow blob layer absolute top-24 -right-10 w-40 h-40 rounded-full bg-accent-neon/10 blur-2xl" />

            {/* Neon ring (SVG draw-in) */}
            <svg className="parallax-fast layer absolute -right-8 top-4" width="240" height="240" viewBox="0 0 240 240" aria-hidden>
              <defs>
                <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="#00f5ff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="120" r="88" fill="url(#ringGlow)" opacity="0.22" />
              <circle ref={ringPathRef} cx="120" cy="120" r="88" stroke="#00f5ff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 560, strokeDashoffset: 0 }} />
            </svg>

            {/* Floating Card */}
            <motion.div
              ref={cardRef}
              className="layer relative mx-auto w-[85%] max-w-sm aspect-[5/3] rounded-2xl bg-gradient-to-br from-[#0b1a2b] to-[#061326] border border-white/10 shadow-glass overflow-hidden will-transform"
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
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-[100%] bg-[radial-gradient(closest-side,rgba(0,0,0,.35),transparent)]" aria-hidden />
            </motion.div>

            {/* Floating Neon Orbs */}
            {[0,1,2,3].map((i) => (
              <div
                key={i}
                ref={(el) => (orbsRef.current[i] = el)}
                className={`parallax-fast layer absolute w-8 h-8 rounded-full ${i % 3 === 0 ? 'bg-[#ff6b6b]' : 'bg-[#00f5ff]'} blur-sm opacity-80 will-transform`}
                style={{ top: ["12%","70%","40%","8%"][i], left: ["8%","72%","52%","86%"][i] }}
              />
            ))}
          </div>
        </div>
      </div>
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

function HeadingReveal({ text, reduced }) {
  const words = text.split(' ')
  const variants = {
    hidden: { y: '100%' },
    show: (i) => ({ y: 0, transition: { delay: 0.06 * i, type: 'spring', stiffness: 400, damping: 28 } })
  }
  return (
    <h1 className="hero-title mt-5 text-3xl md:text-5xl font-heading font-extrabold leading-tight tracking-tight">
      {words.map((w, i) => (
        <span className="word-clip line" key={i}>
          <motion.span
            custom={i}
            variants={variants}
            initial={reduced ? 'hidden' : false}
            animate={reduced ? 'show' : false}
            className="inline-block mr-1"
          >
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
