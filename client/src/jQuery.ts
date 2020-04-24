import jquery from "jquery";

declare global { interface Window { $: typeof jquery } }
window.$ = jquery;
