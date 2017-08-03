import path from 'path';
import uuid from 'uuid';
import Joi from 'joi';
import { has } from 'lodash';

import { LOGGER_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';

const NAME = 'tokens-object';

const FILE_NAME = path.join('sessions', 'tokens.json');

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  storage: STORAGE_SCHEMA,
};

export default class TokensObjectSessions {
  constructor(options) {
    Joi.assert(options, OPTIONS_SCHEMA);
    this.logger = options.logger.child({
      context: NAME,
    });
    this.storage = options.storage;
  }

  async _getTokens() {
    const result = await this.storage.readFile(FILE_NAME);
    if (!result.exists) {
      return {};
    }
    return JSON.parse(result.data);
  }

  async createToken(username) {
    this.logger.info(username);
    const tokens = await this._getTokens();
    const token = uuid.v4();
    tokens[token] = {
      username,
      timestamp: new Date(),
    };
    await this.storage.writeFile(FILE_NAME, JSON.stringify(tokens, null, '  '));
    return token;
  }

  async findUsernameByToken(token) {
    this.logger.info(token);
    const tokens = await this._getTokens();
    if (!has(tokens, token)) {
      return null;
    }
    return tokens[token].username;
  }
}
