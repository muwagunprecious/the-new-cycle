const fs = require('fs');
const path = require('path');

const root = process.cwd();
console.log(`Monitoring ${root} for 30 seconds...`);

const watcher = fs.watch(root, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes('.next') && !filename.includes('node_modules') && !filename.includes('.git')) {
        console.log(`[${new Date().toISOString()}] ${eventType}: ${filename}`);
    }
});

setTimeout(() => {
    watcher.close();
    console.log('Monitoring stopped.');
}, 30000);
