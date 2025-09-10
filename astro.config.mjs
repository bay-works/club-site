// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import worker from '@astropub/worker';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://bay.works/',
    integrations: [react(), worker(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
    },
});
