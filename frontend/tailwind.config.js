/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sil-dark': '#2A2A2A',
        'sil-light': '#D9D9D9',
        'sil-black': '#000000',
        'sil-white': '#FFFFFF',
        'sil-accent': '#297BFF',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'container': '1440px',
      },
      spacing: {
        'section': '120px',
        'section-mobile': '80px',
      },
    },
  },
  plugins: [],
}



