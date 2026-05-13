import { EventEmitter } from 'events';
import { logger } from './api-utils.js';

/**
 * BackgroundTaskWorker
 * A lightweight, in-memory task queue to prevent blocking the main request cycle.
 * Designed to handle heavy operations like AI verification, Email sending, and Sockets.
 */
class BackgroundTaskWorker extends EventEmitter {
    constructor() {
        super();
        this.on('error', (err) => logger.error('Worker Error', err));
        this.queueCount = 0;
    }

    /**
     * Dispatches a task to be executed in the next cycle of the event loop.
     * @param {string} taskName - Name of the task for logging.
     * @param {Function} taskFn - The async function to execute.
     */
    enqueue(taskName, taskFn) {
        this.queueCount++;
        // Use setImmediate to ensure the task runs after the current request completes its IO
        setImmediate(async () => {
            const start = Date.now();
            try {
                logger.info(`[Worker] Starting Task: ${taskName}`);
                await taskFn();
                const duration = Date.now() - start;
                logger.info(`[Worker] Task Completed: ${taskName} (${duration}ms)`);
            } catch (error) {
                logger.error(`[Worker] Task Failed: ${taskName}`, error);
            } finally {
                this.queueCount--;
            }
        });
    }

    getStats() {
        return {
            activeTasks: this.queueCount
        };
    }
}

// Singleton instance
const worker = new BackgroundTaskWorker();

export default worker;
