import h2o2 from '@hapi/h2o2';
import Hapi from '@hapi/hapi';
import hapiPino from 'hapi-pino';
import config from './config';
import npmToken from './plugins/npm-token';
import packageFile from './plugins/package-file';
import packageMetadata from './plugins/package-metadata';
import packagePublish from './plugins/package-publish';
import userIdentity from './plugins/user-identity';
import userLogin from './plugins/user-login';

const server = new Hapi.Server({
  port: config.port,
});

const logger = config.logger.child({
  context: 'server',
});

logger.info('umask %s', process.umask(config.umask));

const plugins = [
  {
    plugin: hapiPino,
    options: {
      stream: config.pinoDestination,
      redact: ['req.headers.authorization'],
    },
  },
  {
    plugin: h2o2,
  },
  {
    plugin: npmToken,
    options: {
      logger: config.logger,
      sessions: config.sessions,
    },
  },
  {
    plugin: packageMetadata,
    options: {
      alwaysAuth: config.alwaysAuth,
      logger: config.logger,
      storage: config.storage,
      origin: config.origin,
    },
  },
  {
    plugin: packageFile,
    options: {
      alwaysAuth: config.alwaysAuth,
      logger: config.logger,
      storage: config.storage,
      origin: config.origin,
    },
  },
  {
    plugin: packagePublish,
    options: {
      logger: config.logger,
      storage: config.storage,
      forceHTTPS: config.forceHTTPS,
      forceHTTPSHost: config.forceHTTPSHost,
      slackWebHook: config.slackWebHook,
    },
  },
  {
    plugin: userLogin,
    options: {
      logger: config.logger,
      sessions: config.sessions,
      authentication: config.authentication,
    },
  },
  {
    plugin: userIdentity,
  },
];

async function start() {
  await server.register(plugins);
  await server.start();
  logger.info('Server running at: %s', server.info.uri);
}

start().catch(error => {
  logger.error(error, 'Unable to start server');
});
