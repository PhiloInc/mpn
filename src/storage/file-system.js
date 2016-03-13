import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

import config from '../lib/config';

import createLogger from '../lib/logger-factory';
const logger = createLogger('fileSystemStorage');

function createFullPath(fileName) {
  return path.join(config.mpnDir, fileName);
}

function createDirectory(fileName) {
  return new Promise((resolve, reject) => {
    const dirName = path.dirname(fileName);
    mkdirp(dirName, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

export function readFile(fileName) {
  const fullPath = createFullPath(fileName);
  logger.info(fullPath);
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          logger.info(`${fullPath} not found`);
          return resolve({
            exists: false,
          });
        }
        logger.error(error, `${fullPath} error`);
        return reject(error);
      }
      return resolve({
        exists: true,
        data,
      });
    });
  });
}

export function readStream(fileName) {
  const fullPath = createFullPath(fileName);
  logger.info(fullPath);
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(fullPath);
    fileStream.on('open', () => resolve({
      exists: true,
      stream: fileStream,
    }));
    fileStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        logger.info(`${fullPath} not found`);
        return resolve({
          exists: false,
        });
      }
      logger.error(error, `${fullPath} error`);
      return reject(error);
    });
  });
}

export async function writeFile(fileName, data) {
  const fullPath = createFullPath(fileName);
  logger.info(fullPath);
  return createDirectory(fullPath).then(() => new Promise((resolve, reject) => {
    fs.writeFile(fullPath, data, (error) => {
      if (error) {
        logger.error(error, `${fullPath} error`);
        return reject(error);
      }
      return resolve();
    });
  }));
}
