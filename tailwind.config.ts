import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Convert your hex colors to HSL equivalents
        border: "214 25% 27%", // #374151 (gray-700)
        input: "220 26% 14%", // #1f2937 (gray-800)
        ring: "262 83% 58%", // #a855f7 (purple-500)
        background: "0 0% 4%", // #0A0A0A (new background color)
        foreground: "210 20% 98%", // #f9fafb (gray-50)
        primary: {
          DEFAULT: "262 83% 58%", // #a855f7 (purple-500)
          foreground: "0 0% 100%", // #ffffff
        },
        secondary: {
          DEFAULT: "214 25% 27%", // #374151 (gray-700)
          foreground: "210 20% 98%", // #f9fafb (gray-50)
        },
        destructive: {
          DEFAULT: "0 72% 51%", // #dc2626 (red-600)
          foreground: "0 0% 100%", // #ffffff
        },
        muted: {
          DEFAULT: "214 25% 27%", // #374151 (gray-700)
          foreground: "214 17% 51%", // #9ca3af (gray-400)
        },
        accent: {
          DEFAULT: "263 69% 42%", // #7c3aed (purple-600)
          foreground: "0 0% 100%", // #ffffff
        },
        popover: {
          DEFAULT: "220 26% 14%", // #1f2937 (gray-800)
          foreground: "210 20% 98%", // #f9fafb (gray-50)
        },
        card: {
          DEFAULT: "220 26% 14%", // #1f2937 (gray-800)
          foreground: "210 20% 98%", // #f9fafb (gray-50)
        },
      },
      borderRadius: {
        lg: "0.5rem", // matches your --radius value
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config