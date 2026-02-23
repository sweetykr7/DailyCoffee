import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          DEFAULT: '#3d2b1f',
          light: '#8b6651',
          dark: '#1a1612',
        },
        cream: {
          DEFAULT: '#faf8f5',
          warm: '#f5efe6',
        },
        accent: {
          DEFAULT: '#c4924a',
          light: '#d4a86a',
          dark: '#a87a3a',
        },
        sub: '#7a6a60',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Jost', 'Pretendard', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
