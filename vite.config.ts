import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages under /<repo>/ and inside any CMS embed.
export default defineConfig({ base: './' });
