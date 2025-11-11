/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        "Space Grotesk",
        "Helvetica Neue",
        "Arial",
        "system-ui",
        "-apple-system",
        "sans-serif",
      ],
    },
    extend: {
      // 一時的にアニメーション定義を無効化（コメントアウト）
      keyframes: {
        /* fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideForward: {
          "0%": { transform: "translateX(0)" },
          "60%": { transform: "translateX(85%)" },
          "100%": { transform: "translateX(105%)" },
        },
        stackShift: {
          "0%": { transform: "translateX(-12%) scale(0.9)" },
          "60%": { transform: "translateX(-6%) scale(0.96)" },
          "100%": { transform: "translateX(0) scale(1)" },
        }, */
      },
      animation: {
        /* fadeIn: "fadeIn 0.55s ease-out both",
        slideForward: "slideForward 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        stackShift: "stackShift 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards", */
      },
    },
  },
  plugins: [],
};
