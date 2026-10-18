/** @type {import('tailwindcss').Config} */
// Tokens tomados de :root del mockup (Challenges/02/pupigo-mockup.html)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: { DEFAULT: '#2563EB', dark: '#1D4ED8', 50: '#EFF6FF' },
        ink: '#10192B',
        green: { DEFAULT: '#16A34A', bg: '#E9F9EF' },
        gray: { 25: '#FAFBFC', 50: '#F5F7FA', 100: '#EEF1F5', 200: '#E2E6EC', 400: '#9AA3B2', 500: '#6B7280' },
        teal: '#0EA5A5',
        map: { land: '#F3F1EA', road: '#FFFFFF', hwy: '#F6C875', river: '#AEE1F0', block: '#EAE6D9', park: '#DCEBD2' },
      },
      fontFamily: { sans: ['Inter', '-apple-system', 'SF Pro Display', 'BlinkMacSystemFont', 'sans-serif'] },
      borderRadius: { md: '14px', sm: '10px' },
      boxShadow: {
        soft: '0 1px 2px rgba(16,25,43,0.04),0 8px 24px rgba(16,25,43,0.06)',
        card: '0 1px 2px rgba(16,25,43,0.03),0 4px 14px rgba(16,25,43,0.05)',
        float: '0 6px 20px rgba(37,99,235,0.28)',
      },
    },
  },
  plugins: [],
};
