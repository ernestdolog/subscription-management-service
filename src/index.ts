/**
 * The Index
 * =========
 * Starts runnable based on the arguments.
 *
 * Available runnables
 * - http-server
 * - consumer
 */
import './preload.js';
import esMain from 'es-main';

const runnable = process.argv[2] ?? 'http-server';

if (esMain(import.meta)) {
    if (runnable === 'http-server') {
        import('./http-server.runnable.js');
    } else if (runnable === 'consumer') {
        import('./consumer.runnable.js');
    }
}
