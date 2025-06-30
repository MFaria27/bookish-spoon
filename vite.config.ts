import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'robots.txt'],
			manifest: {
				"name": "Bookish Spoon",
				"short_name": "Bksh",
				"start_url": "/",
				"display": "standalone",
				"background_color": "#121212",
				"theme_color": "#00d1b2",
				"icons": [
					{
					"src": "/icons/android-chrome-192x192.png",
					"sizes": "192x192",
					"type": "image/png"
					},
					{
					"src": "/icons/android-chrome-512x512.png",
					"sizes": "512x512",
					"type": "image/png"
					}
				]
			}
		})
	]
});
