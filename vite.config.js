import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Build setup for rendering the kb export locally. The export ships src/ only (apps/kb/ → src/).
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } }), vitePreprocess()],
      adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
      prerender: {
        entries: ['/kb', '/kb/incidents/4471', '/kb/incidents/4471/problems'],
        handleHttpError: 'warn',
      },
    }),
  ],
});
