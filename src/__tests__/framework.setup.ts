process.env = {
    ...process.env,
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
};

import '#app/preload.js';
