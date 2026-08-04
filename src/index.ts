import './preload.js';
import esMain from 'es-main';

const runnable = process.argv[2] ?? 'api';

if (esMain(import.meta)) {
    if (runnable === 'api') {
        import('./api-server.runnable.js');
    } else if (runnable === 'event') {
        import('./event-listener.runnable.js');
    } else if (runnable === 'relay') {
        import('./outbox-relay.runnable.js');
    }
}
