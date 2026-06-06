/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Botswana-inspired brand palette
        brand: {
          azure: '#0077C8',       // Botswana azure blue – primary CTA
          'azure-dark': '#005FA3',
          'azure-light': '#E8F4FF',
          'azure-mid': '#3B99E0',
          black: '#0A0A0A',       // Near-black – authority
          'black-soft': '#111827',
          charcoal: '#1C1C2E',    // Deep charcoal – sidebars
          'charcoal-mid': '#252540',
          pearl: '#F7F8FC',       // Off-white background
          'pearl-dark': '#ECEEF5',
          gold: '#C9A84C',        // Accent gold – premium feel
          'gold-light': '#F5E6C0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
        'glow-azure': '0 0 30px rgba(0,119,200,0.25)',
        'glow-gold': '0 0 20px rgba(201,168,76,0.3)',
      },
      backgroundImage: {
        'gradient-azure': 'linear-gradient(135deg, #0A0A0A 0%, #1C1C2E 50%, #003D6B 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #F7F8FC 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #F0D080)',
      },
    },
  },
  plugins: [],
};
