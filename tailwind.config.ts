import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0908',
          elev: '#121110',
          input: '#0f0e0d',
          hover: '#181614',
        },
        border: {
          DEFAULT: '#26231f',
          hi: '#3a342d',
          accent: '#d97757',
        },
        fg: {
          DEFAULT: '#e8e4dc',
          dim: '#a8a095',
          mute: '#6f685c',
          faint: '#413c34',
        },
        ember: {
          DEFAULT: '#d97757',
          hi: '#e89573',
          dim: '#a8593f',
        },
        term: {
          ok: '#7cb96d',
          warn: '#e5c07b',
          err: '#e06c75',
          info: '#61afef',
        },
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '1.45' }],
        sm: ['13px', { lineHeight: '1.55' }],
        base: ['14px', { lineHeight: '1.6' }],
        lg: ['16px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.15' }],
        '3xl': ['40px', { lineHeight: '1.05' }],
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typein: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        scan: 'scan 8s linear infinite',
        typein: 'typein 0.35s ease-out forwards',
        'pulse-ring': 'pulseRing 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
