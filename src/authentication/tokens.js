import fs from 'fs';
import path from 'path';
import uuid from 'node-uuid';

import createLogger from '../lib/logger-factory';
const logger = createLogger('tokens');

import config from '../lib/config';

// TODO DR: make store layer API better so this can use it
function getTokens() {
  const localFile = path.join(config.mpnDir, 'authentication', 'tokens');
  logger.info(`getTokens: ${localFile}`);
  return new Promise((resolve, reject) => {
    fs.readFile(localFile, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          logger.info(`${localFile} not found`);
          return resolve({});
        }
        logger.error(error, `Error reading ${localFile}`);
        return reject(error);
      }
      return resolve(JSON.parse(data));
    });
  });
}

function writeTokens(tokens) {
  const localFile = path.join(config.mpnDir, 'authentication', 'tokens');
  logger.info(`writeTokens: ${localFile}`);
  return new Promise((resolve, reject) => {
    fs.writeFile(localFile, JSON.stringify(tokens, null, '  '), (error) => {
      if (error) {
        logger.error(error, `Error reading ${localFile}`);
        return reject(error);
      }
      return resolve();
    });
  });
}

export async function createToken(username) {
  const tokens = await getTokens();
  const token = uuid.v4();
  tokens[token] = {
    username,
    timestamp: new Date(),
  };
  await writeTokens(tokens);
  return token;
}
