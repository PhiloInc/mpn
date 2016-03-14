import Joi from 'joi';

import createLogger from '../lib/logger-factory';
const logger = createLogger('packageFile');

import { AUTH_STRATEGY } from './npm-token';
import { filePath } from '../lib/packages';

const optionsSchema = {
  alwaysAuth: Joi.boolean().required(),
};

async function handler(request, reply) {
  const packageName = request.params.name;
  const file = request.params.file;
  const fileName = filePath(packageName, file);
  logger.info(packageName);
  try {
    const result = await request.server.app.storage.readStream(fileName);
    if (!result.exists) {
      return reply.proxy(request.server.app.config.origin);
    }
    return reply(result.stream);
  } catch (error) {
    logger.error(error, `${packageName} error`);
    return reply(error);
  }
}

function register(server, options, next) {
  Joi.assert(options, optionsSchema);
  const route = {
    method: 'GET',
    path: '/{name}/-/{file}',
    handler,
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
  name: 'package-file',
};

export default register;
