import Joi from '@hapi/joi';
import { metadataPath } from '../lib/packages';
import { ALWAYS_AUTH_SCHEMA, LOGGER_SCHEMA, ORIGIN_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';
import { AUTH_STRATEGY } from './npm-token';

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

  return async function handler(request, response) {
    const packageName = request.params.name;
    logger.info(packageName);
    const fileName = metadataPath(packageName);
    const result = await storage.readFile(fileName);
    if (!result.exists) {
      return response.proxy(origin);
    }
    return response.response(result.data).type('application/json');
  };
}

async function register(server, options) {
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
}

export default {
  name: NAME,
  register,
};
