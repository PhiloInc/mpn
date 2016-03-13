import path from 'path';

import createLogger from '../lib/logger-factory';
const logger = createLogger('packageFile');

import config from '../lib/config';

import * as storage from '../storage/file-system';

async function handler(request, reply) {
  const packageName = request.params.name;
  const file = request.params.file;
  const fileName = path.join('files', packageName, file);
  logger.info(packageName);
  try {
    const result = await storage.readStream(fileName);
    if (!result.exists) {
      return reply.proxy(config.origin);
    }
    return reply(result.stream);
  } catch (error) {
    logger.error(error, `${packageName} error`);
    return reply(error);
  }
}

function register(server, options, next) {
  server.route({
    method: 'GET',
    path: '/{name}/-/{file}',
    handler,
  });

  next();
}

register.attributes = {
  name: 'package-file',
  version: '1.0.0',
};

export default register;
