/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12203D',      // deep indigo — headings, primary text
        paper: '#FFFFFF',    // page background
        mist: '#F3F6F5',     // section background, cool pale sage-grey
        slate: '#5B6472',    // secondary text
        gold: '#F2A93B',     // marigold accent — CTAs, highlights
        leaf: '#2E7D5B',     // deep green accent — links, secondary CTA
        line: '#DEE3E1',     // hairline borders
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
