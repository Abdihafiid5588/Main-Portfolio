/**** Tailwind Config for Futuristic Portfolio ****/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: "#071028",
          glass: "#0f1724"
        },
        accent: {
          neon: "#00f5ff",
          warm: "#ff6b6b"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        heading: ["Poppins", "Inter", "system-ui", "Arial", "sans-serif"],
        mono: ["Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        hero: "linear-gradient(135deg,#001122 0%, #071028 40%, #0b1a2b 100%)",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,245,255,0.35), 0 0 60px rgba(0,245,255,0.15)",
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0,245,255,0.0)' },
          '50%': { boxShadow: '0 0 18px rgba(0,245,255,0.45)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        pulseNeon: 'pulseNeon 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
