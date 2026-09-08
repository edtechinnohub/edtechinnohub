import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.edtechinnohub.org',
  integrations: [tailwind({ applyBaseStyles: false })],
});
