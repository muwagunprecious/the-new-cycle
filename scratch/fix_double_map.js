const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line index with the double map
const target = '{orders.map((order) => (';
let firstIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(target)) {
        if (firstIndex === -1) {
            firstIndex = i;
        } else if (i === firstIndex + 1) {
            // Found the duplicate!
            lines.splice(i, 1);
            fs.writeFileSync(path, lines.join('\n'));
            console.log('Successfully removed duplicate map line at index', i);
            process.exit(0);
        }
    } else {
        firstIndex = -1;
    }
}

console.log('Could not find consecutive duplicate lines.');
