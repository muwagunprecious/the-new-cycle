const net = require('net');

function checkConnection(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 5000;

        socket.setTimeout(timeout);
        socket.once('connect', () => {
            console.log(`[SUCCESS] Connected to ${host}:${port}`);
            socket.destroy();
            resolve(true);
        });

        socket.once('timeout', () => {
            console.log(`[TIMEOUT] Connection to ${host}:${port} timed out after ${timeout}ms`);
            socket.destroy();
            resolve(false);
        });

        socket.once('error', (err) => {
            console.log(`[ERROR] Connection to ${host}:${port} failed: ${err.message}`);
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}

async function runDiagnostics() {
    const host = 'aws-1-eu-west-1.pooler.supabase.com';
    console.log(`Starting network diagnostics for ${host}...`);

    await checkConnection(host, 5432); // Session port
    await checkConnection(host, 6543); // Pooler port

    console.log('Diagnostics complete.');
}

runDiagnostics();
