import Joi from '@hapi/joi';

import { AUTH_STRATEGY } from './npm-token';
import { filePath } from '../lib/packages';
import { ALWAYS_AUTH_SCHEMA, LOGGER_SCHEMA, ORIGIN_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';

const NAME = 'package-file';

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
    const { name: packageName, file } = request.params;
    const fileName = filePath(packageName, file);
    logger.info(packageName);
    const result = await storage.readStream(fileName);
    if (!result.exists) {
      return response.proxy(origin);
    }
    return result.stream;
  };
}

async function register(server, options) {
  Joi.assert(options, OPTIONS_SCHEMA);

  const route = {
    method: 'GET',
    path: '/{name*2}/-/{file*2}',
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
