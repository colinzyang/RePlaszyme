/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0f172a", // Deep Scientific Blue
        "accent": "#0ea5e9", // Vibrant Teal-ish Blue
        "accent-glow": "#38bdf8",
        "background-light": "#f8fafc", // Warm white/light gray
        "surface-light": "rgba(255, 255, 255, 0.7)",
        "border-light": "#e2e8f0",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      backgroundImage: {
        'mesh-gradient-light': 'radial-gradient(at 0% 0%, rgba(255, 255, 255, 1) 0px, transparent 50%), radial-gradient(at 98% 1%, rgba(14, 165, 233, 0.08) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(255, 255, 255, 1) 0px, transparent 50%), radial-gradient(at 98% 100%, rgba(56, 189, 248, 0.12) 0px, transparent 50%), radial-gradient(at 50% 50%, #f8fafc 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
