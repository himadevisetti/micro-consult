"use strict";
// src/proxyTest.ts
fetch('/api/test-proxy')
    .then(res => res.text())
    .then(msg => console.log('Proxy test succeeded:', msg))
    .catch(err => console.error('Proxy test failed:', err));
