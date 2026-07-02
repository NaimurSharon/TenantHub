/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          light: "#DBEAFE",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#475569",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        input: "#F1F5F9",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  plugins: [],
};
