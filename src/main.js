import App from './App.svelte';
import config from './js/config.js';
import * as db from './js/db.js';

db.initDB();

const app = new App({
	target: document.body,
});

document.body.className = config.theme;

export default app;