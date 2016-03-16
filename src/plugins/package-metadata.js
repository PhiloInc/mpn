import Joi from 'joi';

import { AUTH_STRATEGY } from './npm-token';
import { metadataPath } from '../lib/packages';
import {
  ALWAYS_AUTH_SCHEMA,
  LOGGER_SCHEMA,
  ORIGIN_SCHEMA,
  STORAGE_SCHEMA,
} from '../lib/schema';

const NAME = 'package-metadata';

const OPTIONS_SCHEMA = {
  alwaysAuth: ALWAYS_AUTH_SCHEMA,
  logger: LOGGER_SCHEMA,
  storage: STORAGE_SCHEMA,
  origin: ORIGIN_SCHEMA,
};

function createHandler({ logger: parentLogger, storage, origin }) {
  const logger = parentLogger.child({
    context: NAME,
  });

  return async function handler(request, reply) {
    const packageName = request.params.name;
    logger.info(packageName);
    const fileName = metadataPath(packageName);
    const result = await storage.readFile(fileName);
    if (!result.exists) {
      return reply.proxy(origin);
    }
    return reply(result.data).type('application/json');
  };
}

function register(server, options, next) {
  Joi.assert(options, OPTIONS_SCHEMA);

  const route = {
    method: 'GET',
    path: '/{name}',
    handler: createHandler(options),
  };
  if (options.alwaysAuth) {
    route.config = {
      auth: AUTH_STRATEGY,
    };
  }
  server.route(route);

  next();
}

register.attributes = {
  name: NAME,
};

export default register;
