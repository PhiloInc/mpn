import bunyan from 'bunyan';
import debug from 'debug';
import config from './config';

const streams = [];

/* istanbul ignore next */
if (config.logType === 'stdout') {
  streams.push({
    stream: process.stdout,
  });
} else {
  streams.push({
    path: config.logType,
  });
}

const logger = bunyan.createLogger({
  name: 'mpn',
  streams,
});
debug.log = logger.info.bind(logger);

const loggers = {};

export default function create(context) {
  if (!loggers.hasOwnProperty(context)) {
    loggers[context] = logger.child({
      context,
    });
  }
  return loggers[context];
}
