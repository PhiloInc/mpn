import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Joi from 'joi';

import Storage from './storage';

import createLogger from '../lib/logger-factory';
const logger = createLogger('fileSystemStorage');

const optionsSchema = {
  baseDirectory: Joi.string().required(),
};

export default class FileSystemStorage extends Storage {
  constructor(options) {
    super(options);
    Joi.assert(options, optionsSchema);
    this.baseDirectory = options.baseDirectory;
  }

  _createFullPath(fileName) {
    return path.join(this.baseDirectory, fileName);
  }

  _createDirectory(fileName) {
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

  readFile(fileName) {
    const fullPath = this._createFullPath(fileName);
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

  readStream(fileName) {
    const fullPath = this._createFullPath(fileName);
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

  async writeFile(fileName, data) {
    const fullPath = this._createFullPath(fileName);
    logger.info(fullPath);
    return this._createDirectory(fullPath).then(() => new Promise((resolve, reject) => {
      fs.writeFile(fullPath, data, (error) => {
        if (error) {
          logger.error(error, `${fullPath} error`);
          return reject(error);
        }
        return resolve();
      });
    }));
  }
}
