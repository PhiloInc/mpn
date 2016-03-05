import createLogger from '../lib/logger-factory';
const logger = createLogger('packageFile');

import createChain from '../lib/chain';

import * as fileSystemReader from '../readers/file-system';
import * as originReader from '../readers/origin';

const fileChain = createChain([
  fileSystemReader.file,
  originReader.file,
]);

export default async function handler(request, reply) {
  const packageName = request.params.name;
  const fileName = request.params.file;
  try {
    const file = await fileChain(packageName, fileName);
    if (file === null) {
      return reply(`${packageName} not found`).code(404);
    }
    return reply(file);
  } catch (error) {
    logger.error(error, `Error loading ${packageName}`);
    return reply(error);
  }
}
