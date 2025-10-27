import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Noto Serif JP', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        chibic: {
          primary: '#0B7FAD',
          'primary-hover': '#1E8FB8',
          'primary-active': '#085F84',
        },
        semantic: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
        chart: {
          series1: '#0B7FAD',
          series2: '#60a5fa',
          series3: '#a3e635',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;


