const log = require('electron-log');

log.transports.remote.level = 'info';

module.exports = {
    error: (...params) => {
        log.error(...params)
    },
    warn: (...params) => {
        log.warn(...params)
    },
    info: (...params) => {
        log.info(...params)
    },
    log: (...params) => {
        log.info(...params)
    }
}