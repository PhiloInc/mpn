import fetch from 'node-fetch';
import url from 'url';

import createLogger from '../lib/logger-factory';
const logger = createLogger('originReader');

import config from '../lib/config';

// TODO: add request timeout
export function metadata(packageName) {
  const originUrl = url.resolve(config.origin, `/${packageName}`);
  logger.info(`metadata: ${originUrl}`);
  return fetch(originUrl).then((response) => {
    if (response.status === 404) {
      logger.info(`${originUrl} not found`);
      return null;
    }
    if (response.status !== 200) {
      const error = new Error(`Wanted 200 got ${response.status} for ${originUrl}`);
      logger.error(error);
      throw error;
    }
    return response.json();
  });
}

export function file(packageName, fileName) {
  const originUrl = url.resolve(config.origin, `/${packageName}/-/${fileName}`);
  logger.info(`file: ${originUrl}`);
  return fetch(originUrl).then((response) => {
    if (response.status === 404) {
      logger.info(`${originUrl} not found`);
      return null;
    }
    if (response.status !== 200) {
      const error = new Error(`Wanted 200 got ${response.status} for ${originUrl}`);
      logger.error(error);
      throw error;
    }
    return response.body;
  });
}
