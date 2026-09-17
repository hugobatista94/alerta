import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        alerta: {
          red: '#E31E24',
          black: '#121212',
          charcoal: '#1E1E1E',
          light: '#F4F4F4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
