import path from 'path';
import uuid from 'node-uuid';
import Joi from 'joi';

import Sessions from './sessions';
import Storage from '../storage/storage';

import createLogger from '../lib/logger-factory';
const logger = createLogger('tokens');

const fileName = path.join('sessions', 'tokens.json');

const optionsSchema = {
  storage: Joi.object().type(Storage).required(),
};

export default class TokensObjectSessions extends Sessions {
  constructor(options) {
    super(options);
    Joi.assert(options, optionsSchema);
    this.storage = options.storage;
  }

  async _getTokens() {
    const result = await this.storage.readFile(fileName);
    if (!result.exists) {
      return {};
    }
    return JSON.parse(result.data);
  }

  async createToken(username) {
    logger.info(username);
    const tokens = await this._getTokens();
    const token = uuid.v4();
    tokens[token] = {
      username,
      timestamp: new Date(),
    };
    await this.storage.writeFile(fileName, JSON.stringify(tokens, null, '  '));
    return token;
  }

  async findUsernameByToken(token) {
    logger.info(token);
    const tokens = await this._getTokens();
    if (!tokens.hasOwnProperty(token)) {
      return null;
    }
    return tokens[token].username;
  }
}
