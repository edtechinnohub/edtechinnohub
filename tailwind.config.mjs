/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#0F3D2E',   // deep forest green — nav, footer, dark sections
        green: {
          DEFAULT: '#1E7145', // primary green — CTAs, links, accents
          light: '#2F9161',
        },
        mint: '#EAF4EE',      // pale green section tint
        ink: '#181B18',       // near-black charcoal — body text/headings
        slate: '#5B655D',     // secondary text (green-tinted grey)
        paper: '#FFFFFF',
        line: '#DCE6DF',
        sand: '#F6F4EF',      // warm neutral for image-placeholder blocks
      },
      fontFamily: {
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
