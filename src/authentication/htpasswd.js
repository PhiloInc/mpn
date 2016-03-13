import path from 'path';
import htpasswd from 'htpasswd-auth';

import createLogger from '../lib/logger-factory';
const logger = createLogger('htpasswdAuthentication');

const fileName = path.join('authentication', 'htpasswd');

import * as storage from '../storage/file-system';

export async function authenticate(username, password) {
  logger.info(username);
  const result = await storage.readFile(fileName);
  if (!result.exists) {
    return false;
  }
  return htpasswd.authenticate(username, password, result.data.toString());
}
