import App from './App.svelte';
import config from './js/config.js';
import * as db from './js/db.js';

db.initDB();

// console.log = function () { };

const app = new App({
	target: document.body,
});

document.body.className = config.theme;
document.body.style.fontSize = `${config.fontSize}px`;

export default app;
