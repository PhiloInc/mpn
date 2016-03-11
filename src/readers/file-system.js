import fs from 'fs';
import path from 'path';

import createLogger from '../lib/logger-factory';
const logger = createLogger('fileSystemReader');

import config from '../lib/config';

// TODO DR: add support for 304 like behavior
export function metadata(packageName) {
  const localFile = path.join(config.mpnDir, 'packages', packageName);
  logger.info(`metadata: ${localFile}`);
  return new Promise((resolve, reject) => {
    fs.readFile(localFile, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          logger.info(`${localFile} not found`);
          return resolve(null);
        }
        logger.error(error, `Error reading ${localFile}`);
        return reject(error);
      }
      return resolve(JSON.parse(data));
    });
  });
}

export function file(packageName, fileName) {
  const localFile = path.join(config.mpnDir, 'files', packageName, fileName);
  logger.info(`file: ${localFile}`);
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(localFile);
    readStream.on('open', () => resolve(readStream));
    readStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        logger.info(`${localFile} not found`);
        return resolve(null);
      }
      logger.error(error, `Error reading ${localFile}`);
      return reject(error);
    });
  });
}
