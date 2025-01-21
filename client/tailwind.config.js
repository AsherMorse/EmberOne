/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
      },
      width: {
        'logo': '16px',
      },
      height: {
        'logo': '16px',
      }
    },
  },
  plugins: [],
  safelist: ['w-logo', 'h-logo']
} 