import config from './config';

const logger = config.logger.child({
  context: 'server',
});

import Hapi from 'hapi';
const server = new Hapi.Server();

import Good from 'good';
import GoodBunyan from 'good-bunyan';
import h2o2 from 'h2o2';

import npmToken from './plugins/npm-token';
import packageMetadata from './plugins/package-metadata';
import packageFile from './plugins/package-file';
import packagePublish from './plugins/package-publish';
import userLogin from './plugins/user-login';
import userIdentity from './plugins/user-identity';

server.connection({
  port: config.port,
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
}, {
  register: h2o2,
}, {
  register: npmToken,
  options: {
    logger: config.logger,
    sessions: config.sessions,
  },
}, {
  register: packageMetadata,
  options: {
    alwaysAuth: config.alwaysAuth,
    logger: config.logger,
    storage: config.storage,
    origin: config.origin,
  },
}, {
  register: packageFile,
  options: {
    alwaysAuth: config.alwaysAuth,
    logger: config.logger,
    storage: config.storage,
    origin: config.origin,
  },
}, {
  register: packagePublish,
  options: {
    logger: config.logger,
    storage: config.storage,
  },
}, {
  register: userLogin,
  options: {
    logger: config.logger,
    sessions: config.sessions,
    authentication: config.authentication,
  },
}, {
  register: userIdentity,
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
