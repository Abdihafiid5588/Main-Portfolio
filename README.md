Futuristic Header + Hero (Vite + React + Tailwind + Framer Motion + GSAP + tsParticles)

This repo ships a pixel-perfect, futuristic Header and Hero for a developer portfolio. It features a neon/glass aesthetic, layered parallax, particles, and rich micro-interactions powered by Framer Motion and GSAP (with ScrollTrigger). No Three.js.


Quick start

- Install: npm i
- Dev: npm run dev (open the printed local URL)
- Build: npm run build
- Preview build: npm run preview


Where to tweak design tokens

- CSS tokens: src/styles/index.css (colors, glass, helpers)
- Tailwind theme: tailwind.config.js (fonts, background gradient, shadows)
- Fonts are loaded in index.html (Poppins, Inter, Fira Code).

Design tokens used

- background: #071028
- accent/neon: #00f5ff
- warm accent: #ff6b6b
- soft glass: #0f1724 (with bg-white/6 overlays)
- hero gradient: linear-gradient(135deg,#001122 0%, #071028 40%, #0b1a2b 100%)
- fonts: Headings Poppins, Body Inter, Code Fira Code


Particles controls

- Particles are lazily initialized and disabled on mobile and when the user prefers reduced motion.
- To force-disable particles, set an env variable before build/run:
  - Vite: VITE_ENABLE_PARTICLES=false
  - CRA-style (compatibility): REACT_APP_ENABLE_PARTICLES=false


Accessibility & performance

- Semantic HTML, keyboard navigable header and mobile drawer, ESC to close.
- prefers-reduced-motion respected: heavy timelines are disabled.
- All images would be lazy by default (no heavy images included here). Hero mock is pure CSS.
- Mobile-first responsive breakpoints.


Components

- src/components/Header.jsx — glass, sticky, neon border, nav micro-interactions, GSAP-powered mobile drawer, theme toggle.
- src/sections/Hero.jsx — headline word reveal (Framer Motion), parallax layers + floating card (GSAP), particles background (tsParticles), CTAs with shimmer.
- src/styles/index.css — Tailwind directives, theme tokens, glass helpers, particles canvas layer and minor utilities.


Demo video placeholder

- A placeholder file exists at public/demo-hero.mp4. Replace it with your own capture for documentation or portfolio.


QA checklist

- [ ] Hero headline reveals with stagger (Framer Motion)
- [ ] Right visual uses GSAP timeline for layered pop + looped float
- [ ] Particle background initialized after paint, disabled on mobile
- [ ] Header shrinks + pulse neon border on scroll
- [ ] Mobile drawer accessible and animated with GSAP
- [ ] All interactive elements have keyboard & screen-reader support
- [ ] prefers-reduced-motion disables heavy animations
