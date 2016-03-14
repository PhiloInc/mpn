import config from './lib/config';

import createLogger from './lib/logger-factory';
const logger = createLogger('server');

import Hapi from 'hapi';
const server = new Hapi.Server();

import Good from 'good';
import GoodBunyan from 'good-bunyan';
import h2o2 from 'h2o2';

import npmToken from './plugins/npm-token';
import packageMetadata from './plugins/package-metadata';
import packageFile from './plugins/package-file';
import userLogin from './plugins/user-login';
import userIdentity from './plugins/user-identity';

import FileSystemStorage from './storage/file-system';
import HtpasswdAuthentication from './authentication/htpasswd';
import TokensObjectSessions from './sessions/tokens-object';

const storage = new FileSystemStorage({
  baseDirectory: config.mpnDir,
});
server.app.storage = storage;
server.app.authentication = new HtpasswdAuthentication({
  storage,
});
server.app.sessions = new TokensObjectSessions({
  storage,
});
server.app.config = config;

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
}, {
  register: packageMetadata,
  options: {
    alwaysAuth: config.alwaysAuth,
  },
}, {
  register: packageFile,
  options: {
    alwaysAuth: config.alwaysAuth,
  },
}, {
  register: userLogin,
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
