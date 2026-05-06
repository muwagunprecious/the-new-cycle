import fs from 'fs';
import path from 'path';

/**
 * Simple file-based logger for debugging server-side issues.
 */
export function logToFile(message, data = null) {
    try {
        const logDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
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
