import Joi from '@hapi/joi';
import path from 'path';
import { LOGGER_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';
import { authenticate } from './htpasswd-auth';

const NAME = 'htpasswd';

const FILE_NAME = path.join('authentication', 'htpasswd');

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  storage: STORAGE_SCHEMA,
};

export default class HtpasswdAuthentication {
  constructor(options) {
    Joi.assert(options, OPTIONS_SCHEMA);
    this.logger = options.logger.child({
      context: NAME,
    });
    this.storage = options.storage;
  }

  async authenticate(username, password) {
    this.logger.info(username);
    const result = await this.storage.readFile(FILE_NAME);
    if (!result.exists) {
      return false;
    }
    return authenticate(username, password, result.data.toString());
  }
}
