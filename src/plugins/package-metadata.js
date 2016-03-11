import createLogger from '../lib/logger-factory';
const logger = createLogger('packageMetadata');

import config from '../lib/config';

import * as fileSystemReader from '../readers/file-system';

async function handler(request, reply) {
  const packageName = request.params.name;
  try {
    const metadata = await fileSystemReader.metadata(packageName);
    if (metadata === null) {
      return reply.proxy(config.origin);
    }
    return reply(metadata);
  } catch (error) {
    logger.error(error, `Error loading ${packageName}`);
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
