import path from 'path';
import htpasswd from 'htpasswd-auth';
import Joi from 'joi';

import Authentication from './authentication';
import Storage from '../storage/storage';

import createLogger from '../lib/logger-factory';
const logger = createLogger('htpasswdAuthentication');

const fileName = path.join('authentication', 'htpasswd');

const optionsSchema = {
  storage: Joi.object().type(Storage).required(),
};

export default class HtpasswdAuthentication extends Authentication {
  constructor(options) {
    super(options);
    Joi.assert(options, optionsSchema);
    this.storage = options.storage;
  }

  async authenticate(username, password) {
    logger.info(username);
    const result = await this.storage.readFile(fileName);
    if (!result.exists) {
      return false;
    }
    return htpasswd.authenticate(username, password, result.data.toString());
  }
}
