import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const headerRef = useRef(null)
  const drawerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const height = useTransform(scrollY, [0, 120], [96, 64])
  const neonOpacity = useTransform(scrollY, [0, 120], [0.35, 0.9])
  const [lastFocused, setLastFocused] = useState(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => setMounted(true), [])

  // Neon border pulse when scrolling
  useEffect(() => {
    if (!mounted || reduced) return
    const el = headerRef.current
    if (!el) return
    let tween
    const onScroll = () => {
      if (tween) tween.kill()
      tween = gsap.fromTo(el, { boxShadow: '0 0 0 rgba(0,245,255,0)' }, {
        boxShadow: '0 0 18px rgba(0,245,255,0.35)',
        duration: 0.6,
        ease: 'power2.out'
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mounted, reduced])

  // Mobile drawer animation
  useLayoutEffect(() => {
    if (!drawerRef.current) return
    const tl = gsap.timeline({ paused: true })
    const panel = drawerRef.current
    const items = panel.querySelectorAll('a, button')

    tl.fromTo(panel, { xPercent: -100, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.38, ease: 'power3.out' })
      .from(items, { x: -8, autoAlpha: 0, stagger: 0.06, duration: 0.25, ease: 'power2.out' }, '<0.05')

    if (open) tl.play(0)
    else tl.reverse()
    return () => tl.kill()
  }, [open])

  // Accessibility: focus restore and ESC to close
  useEffect(() => {
    const btn = document.getElementById('hamburger')
    if (open) {
      setLastFocused(document.activeElement)
      const first = drawerRef.current.querySelector('a, button')
      first && first.focus()
    } else if (lastFocused) {
      btn && btn.focus()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
      if (e.key === 'Tab' && open) {
        // rudimentary focus trap
        const focusables = drawerRef.current.querySelectorAll('a, button')
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.header
      ref={headerRef}
      style={{ height }}
      className="sticky top-0 z-40 flex items-center glass border-b border-accent-neon/30"
      aria-label="Primary"
    >
      <div className="container mx-auto max-w-7xl px-5 w-full relative flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <a href="#home" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded" aria-label="Go to home">
          <Logo />
          <span className="sr-only">Home</span>
        </a>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#contact" className="btn-shimmer inline-flex items-center rounded-md bg-accent-neon text-[#071028] font-semibold px-4 py-2 shadow-neon hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 transition">
            Hire Me
          </a>
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          id="hamburger"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <aside
        ref={drawerRef}
        className={`${open ? '' : 'pointer-events-none'} fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#0b1a2b]/95 backdrop-blur-md border-r border-accent-neon/25 p-6 md:hidden z-50`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between">
          <Logo size={28} subtle />
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-2">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-lg px-2 py-3 rounded hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              {l.label}
            </a>
          ))}
          <a href="#contact" className="mt-2 inline-flex items-center justify-center rounded-md bg-accent-neon text-[#071028] font-semibold px-4 py-3 shadow-neon">Hire Me</a>
          <div className="pt-2"><ThemeToggle /></div>
        </div>
      </aside>

      {/* Animated neon border at bottom */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[linear-gradient(90deg,transparent,rgba(0,245,255,.9),transparent)]"
        style={{ opacity: neonOpacity }}
      />
    </motion.header>
  )
}

function NavItem({ href, label }) {
  return (
    <motion.a
      href={href}
      className="relative text-sm px-3 py-2 rounded-md text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      whileHover={{ skewX: -2, skewY: 0, y: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
    >
      {label}
      <motion.span
        layoutId={`underline-${label}`}
        className="absolute left-2 right-2 -bottom-0.5 h-[2px] origin-left bg-accent-neon/80"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      />
    </motion.a>
  )
}

function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="text-white" aria-hidden>
      <motion.path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={false} animate={{ d: open ? 'M6 6l12 12' : 'M3 6h18' }} />
      <motion.path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={false} animate={{ opacity: open ? 0 : 1 }} />
      <motion.path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={false} animate={{ d: open ? 'M6 18l12-12' : 'M3 18h18' }} />
    </svg>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    const html = document.documentElement
    if (dark) html.classList.remove('theme-light')
    else html.classList.add('theme-light')
  }, [dark])
  return (
    <button
      className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
      title="Toggle theme"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      )}
    </button>
  )
}

function Logo({ size = 32, subtle = false }) {
  return (
    <div className="relative grid place-items-center">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="text-white"
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 8 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        aria-hidden
      >
        <defs>
          <radialGradient id="ring" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#00f5ff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="20" stroke={subtle ? 'rgba(0,245,255,.5)' : '#00f5ff'} strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="32" r="22" fill="url(#ring)" opacity="0.25" />
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontFamily="Poppins, Inter" fontWeight="700" fontSize="16">DE</text>
      </motion.svg>
    </div>
  )
}
