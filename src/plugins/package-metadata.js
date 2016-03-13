import path from 'path';

import createLogger from '../lib/logger-factory';
const logger = createLogger('packageMetadata');

import config from '../lib/config';

import * as storage from '../storage/file-system';

async function handler(request, reply) {
  const packageName = request.params.name;
  logger.info(packageName);
  try {
    const fileName = path.join('packages', `${packageName}.json`);
    const result = await storage.readFile(fileName);
    if (!result.exists) {
      return reply.proxy(config.origin);
    }
    return reply(result.data).type('application/json');
  } catch (error) {
    logger.error(error, `${packageName} error`);
    return reply(error);
  }
}

function register(server, options, next) {
  server.route({
    method: 'GET',
    path: '/{name}',
    handler,
  });

  next();
}

register.attributes = {
  name: 'package-metadata',
  version: '1.0.0',
};

export default register;
