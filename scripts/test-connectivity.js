const net = require('net');

const HOST = 'aws-1-eu-north-1.pooler.supabase.com';
const PORTS = [6543, 5432, 443];

async function checkPort(port) {
    return new Promise((resolve) => {
        console.log(`Testing connection to ${HOST}:${port}...`);
        const socket = new net.Socket();

        // specific timeout for detection
        socket.setTimeout(5000);

        socket.on('connect', () => {
            console.log(`✅ SUCCESS: Connected to ${HOST}:${port}`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`❌ TIMEOUT: Could not connect to ${HOST}:${port} within 5s`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', (err) => {
            console.log(`❌ ERROR: Failed to connect to ${HOST}:${port} - ${err.message}`);
            resolve(false);
        });

        socket.connect(port, HOST);
    });
}

async function main() {
    console.log("Starting network connectivity diagnostics...");
    let successCount = 0;

    for (const port of PORTS) {
        const result = await checkPort(port);
        if (result) successCount++;
    }

    if (successCount === 0) {
        console.log("\n⚠️  ALL PORTS FAILED. This looks like a system-wide network or firewall issue.");
    } else {
        console.log("\n Connectivity check complete.");
    }
}

main();
