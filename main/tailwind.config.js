/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideForward: {
          "0%": { transform: "translateX(0)" },
          "60%": { transform: "translateX(85%)" },
          "100%": { transform: "translateX(160%)" },
        },
        stackShift: {
          "0%": { transform: "translateX(-22%) scale(0.88)" },
          "60%": { transform: "translateX(-8%) scale(0.95)" },
          "100%": { transform: "translateX(0) scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.55s ease-out both",
        slideForward: "slideForward 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        stackShift: "stackShift 2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
