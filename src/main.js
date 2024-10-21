import App from './App.svelte';
import config from './js/config.js';

const app = new App({
	target: document.body,
});

document.body.className = config.theme;

export default app;
