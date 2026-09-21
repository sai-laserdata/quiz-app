import type { Config } from 'tailwindcss';

/**
 * Palette mirrors laserdata.com. The `slate` and `sky` scales are deliberately
 * remapped onto the brand's near-black surfaces and cyan accent so existing
 * utility classes retone without component churn; `ld.*` is the canonical
 * naming for anything written from here on.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        ld: {
          bg: '#070c0f',
          panel: '#0b1824',
          panel2: '#19232d',
          cyan: '#52eafd',
          lime: '#b8ff52',
          ink: '#07111a',
          gold: '#ffd166'
        },
        // Remapped: surfaces
        slate: {
          50: '#ffffff',
          100: 'rgba(255,255,255,0.92)',
          200: 'rgba(255,255,255,0.82)',
          300: 'rgba(255,255,255,0.70)',
          400: 'rgba(255,255,255,0.55)',
          500: 'rgba(255,255,255,0.42)',
          600: 'rgba(255,255,255,0.28)',
          700: '#243039',
          800: '#19232d',
          900: '#0b1824',
          950: '#070c0f'
        },
        // Remapped: accent
        sky: {
          50: '#ecfeff',
          100: '#cefafe',
          200: '#a2f4fd',
          300: '#52eafd',
          400: '#52eafd',
          500: '#22d3ee',
          600: '#0092b5',
          700: '#007492',
          800: '#005f78',
          900: '#104e64'
        }
      },
      letterSpacing: {
        label: '0.18em'
      }
    }
  },
  plugins: []
};

export default config;
