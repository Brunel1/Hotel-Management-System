import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary)',
          100: 'var(--color-primary)',
          200: 'var(--color-primary)',
          300: 'var(--color-primary)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary)',
          800: 'var(--color-primary)',
          900: 'var(--color-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          50: 'var(--color-secondary)',
          100: 'var(--color-secondary)',
          200: 'var(--color-secondary)',
          300: 'var(--color-secondary)',
          400: 'var(--color-secondary)',
          500: 'var(--color-secondary)',
          600: 'var(--color-secondary)',
          700: 'var(--color-secondary)',
          800: 'var(--color-secondary)',
          900: 'var(--color-secondary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: 'var(--color-accent)',
          100: 'var(--color-accent)',
          200: 'var(--color-accent)',
          300: 'var(--color-accent)',
          400: 'var(--color-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent)',
          700: 'var(--color-accent)',
          800: 'var(--color-accent)',
          900: 'var(--color-accent)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
