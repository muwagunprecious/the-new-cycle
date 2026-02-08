const fs = require('fs');
const path = require('path');

function findEnvFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(findEnvFiles(file));
            }
        } else if (path.basename(file).startsWith('.env')) {
            results.push(file);
        }
    });
    return results;
}

console.log("--- ENV FILE DISCOVERY ---");
const envFiles = findEnvFiles('.');
envFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const hasOldHost = content.includes('connect.supabase.com');
    console.log(`${f}: ${hasOldHost ? "!! CONTAINS OLD HOST !!" : "Clean"}`);
});

console.log("\n--- RUNTIME ENV CHECK ---");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL Host:", process.env.DATABASE_URL.split('@')[1]?.split(':')[0]);
}
console.log("DIRECT_URL:", process.env.DIRECT_URL ? "SET" : "NOT SET");
