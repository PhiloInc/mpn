import config from './lib/config';

import createLogger from './lib/logger-factory';
const logger = createLogger('server');

import Hapi from 'hapi';
const server = new Hapi.Server();

import Good from 'good';
import GoodBunyan from 'good-bunyan';

import Joi from 'joi';

import packageMetadata from './routes/package-metadata';
import packageFile from './routes/package-file';

server.connection({
  port: config.port,
});

// TODO: convert to plugins
// TODO: share validator code
server.route({
  method: 'GET',
  path: '/{name}',
  handler: packageMetadata,
  config: {
    validate: {
      params: {
        name: Joi.string().regex(/^[-a-z0-9.]{1,214}$/),
      },
    },
  },
});

server.route({
  method: 'GET',
  path: '/{name}/-/{file}',
  handler: packageFile,
  config: {
    validate: {
      params: {
        name: Joi.string().regex(/^[-a-z0-9.]{1,214}$/),
        file: Joi.string().regex(/^[-a-z0-9.]+$/),
      },
    },
  },
});

const plugins = [{
  register: Good,
  options: {
    reporters: [{
      reporter: GoodBunyan,
      events: {
        error: '*',
        log: '*',
        ops: '*',
        request: '*',
        response: '*',
      },
      config: {
        logger,
        levels: {
          error: 'error',
          log: 'info',
          ops: 'debug',
          request: 'info',
          response: 'info',
        },
        formatters: {
          error: (data) => [
            {
              err: data.error,
              stack: data.error.stack,
            },
            '[error]',
            data.error.message,
          ],
        },
      },
    }],
  },
}];

server.register(plugins, (error) => {
  if (error) {
    logger.error(error, 'Unable to register plugins');
  } else {
    server.start(() => {
      logger.info('Server running at: %s', server.info.uri);
    });
  }
});
