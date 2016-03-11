import fs from 'fs';
import path from 'path';
import htpasswd from 'htpasswd-auth';

import createLogger from '../lib/logger-factory';
const logger = createLogger('htpasswdAuthentication');

import config from '../lib/config';

// TODO DR: make store layer API better so this can use it
export function authenticate(username, password) {
  const localFile = path.join(config.mpnDir, 'authentication', 'htpasswd');
  logger.info(`authenticate: ${localFile}`);
  return new Promise((resolve, reject) => {
    fs.readFile(localFile, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return resolve(false);
        }
        logger.error(error, `Error reading ${localFile}`);
        return reject(error);
      }
      return resolve(htpasswd.authenticate(username, password, data.toString()));
    });
  });
}
