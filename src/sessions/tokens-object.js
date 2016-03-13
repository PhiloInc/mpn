import path from 'path';
import uuid from 'node-uuid';

import createLogger from '../lib/logger-factory';
const logger = createLogger('tokens');

const fileName = path.join('sessions', 'tokens.json');

import * as storage from '../storage/file-system';

async function getTokens() {
  const result = await storage.readFile(fileName);
  if (!result.exists) {
    return {};
  }
  return JSON.parse(result.data);
}

export async function createToken(username) {
  logger.info(username);
  const tokens = await getTokens();
  const token = uuid.v4();
  tokens[token] = {
    username,
    timestamp: new Date(),
  };
  await storage.writeFile(fileName, JSON.stringify(tokens, null, '  '));
  return token;
}
