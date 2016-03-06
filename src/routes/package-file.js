import createLogger from '../lib/logger-factory';
const logger = createLogger('packageFile');

import config from '../lib/config';

import * as fileSystemReader from '../readers/file-system';

export default async function handler(request, reply) {
  const packageName = request.params.name;
  const fileName = request.params.file;
  try {
    const file = await fileSystemReader.file(packageName, fileName);
    if (file === null) {
      return reply.proxy(config.origin);
    }
    return reply(file);
  } catch (error) {
    logger.error(error, `Error loading ${packageName}`);
    return reply(error);
  }
}
