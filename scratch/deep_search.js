const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                search(filePath);
            }
        } else {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('ORD-B-DEMO-001')) {
                console.log(`Found in: ${filePath}`);
            }
        }
    }
}

console.log('Searching for ORD-B-DEMO-001...');
search('.');
console.log('Search complete.');
