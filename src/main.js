import App from './App.svelte';

const app = new App({
	target: document.body,
});

document.body.className = 'dark';

export default app;
