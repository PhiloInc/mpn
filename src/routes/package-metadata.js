import createLogger from '../lib/logger-factory';
const logger = createLogger('packageMetadata');

import createChain from '../lib/chain';

import * as fileSystemReader from '../readers/file-system';
import * as originReader from '../readers/origin';

const metadataChain = createChain([
  fileSystemReader.metadata,
  originReader.metadata,
]);

export default async function handler(request, reply) {
  const packageName = request.params.name;
  try {
    const metadata = await metadataChain(packageName);
    if (metadata === null) {
      return reply(`${packageName} not found`).code(404);
    }
    return reply(metadata);
  } catch (error) {
    logger.error(error, `Error loading ${packageName}`);
    return reply(error);
  }
}
