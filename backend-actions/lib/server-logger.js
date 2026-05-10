import fs from 'fs';
import path from 'path';

/**
 * Simple file-based logger for debugging server-side issues.
 */
export function logToFile(message, data = null) {
    try {
        if (process.env.NODE_ENV === 'development') return; // Don't write to file in dev to avoid rebuild loops
        
        // Move logs outside the project root to prevent Next.js from watching them and re-compiling constantly
        const logDir = path.join(process.cwd(), '..', 'gocycle-logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logPath = path.join(logDir, 'server-debug.log');
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | DATA: ${JSON.stringify(data).substring(0, 500)}${JSON.stringify(data).length > 500 ? '...' : ''}` : '';
        const logMessage = `[${timestamp}] ${message}${dataStr}\n`;
        fs.appendFileSync(logPath, logMessage);
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
}
