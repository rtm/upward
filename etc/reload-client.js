var RELOAD_PORT;
if (typeof RELOAD_PORT === "undefined") RELOAD_PORT = 32458;
new WebSocket('ws://' + location.hostname + ':' + RELOAD_PORT).onmessage = function() { location.reload(); };
