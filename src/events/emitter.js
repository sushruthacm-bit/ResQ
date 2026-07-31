const { EventEmitter } = require('events');

// Singleton emitter shared across the application
const emitter = new EventEmitter();
emitter.setMaxListeners(20);

module.exports = emitter;
