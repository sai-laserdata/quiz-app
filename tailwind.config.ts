import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          800: '#0a2a3a',
          900: '#062230',
          950: '#041520',
        },
      },
    },
  },
  plugins: []
};

export default config;
