import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        rz: {
          bg: '#070D1A',
          nav: '#080E1C',
          card: '#0A1225',
          input: '#060D1A',
          border: '#0F2040',
          border2: '#1E3A5F',
          text: '#F1F5F9',
          muted: '#94A3B8',
          dim: '#475569',
          faint: '#64748B',
          teal: '#00D4AA',
          blue: '#0D6EFD',
          warn: '#F59E0B',
          danger: '#EF4444',
          purple: '#818CF8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
