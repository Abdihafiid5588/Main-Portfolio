import React from 'react'
import Header from './components/Header'
import Hero from './sections/Hero'

export default function App() {
  return (
    <div className="min-h-screen bg-hero bg-fixed">
      <Header />
      <main>
        <Hero />
        {/* Page filler for scroll demo */}
        <section className="py-32" aria-hidden>
          <div className="container mx-auto px-6 max-w-6xl text-white/60">
            <p className="text-sm">Scroll to test sticky header & parallax.</p>
            <div className="h-[120vh]" />
          </div>
        </section>
      </main>
    </div>
  )
}
