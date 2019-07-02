import Joi from '@hapi/joi';
import Boom from '@hapi/boom';

import { LOGGER_SCHEMA, SESSIONS_SCHEMA } from '../lib/schema';

const NAME = 'npm-token';

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  sessions: SESSIONS_SCHEMA,
};

export const AUTH_SCHEME = 'npm-token';
export const AUTH_STRATEGY = 'npmToken';

function createAuthenticate({ logger: parentLogger, sessions }) {
  const logger = parentLogger.child({
    context: NAME,
  });

  return async function authenticate(request, response) {
    const { authorization } = request.raw.req.headers;
    logger.info(authorization);
    if (!authorization) {
      logger.error('Authorization header missing');
      throw Boom.unauthorized('Authorization header missing');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      logger.error('Authorization header invalid');
      throw Boom.badRequest('Authorization header invalid');
    }
    const token = parts[1];
    const username = await sessions.findUsernameByToken(token);
    if (username === null) {
      logger.error('Token not found');
      throw Boom.unauthorized('Token not found');
    }
    return response.authenticated({ credentials: { username } });
  };
}

function scheme(server, options) {
  Joi.assert(options, OPTIONS_SCHEMA);

  return {
    authenticate: createAuthenticate(options),
  };
}

async function register(server, options) {
  Joi.assert(options, OPTIONS_SCHEMA);

  server.auth.scheme(AUTH_SCHEME, scheme);
  server.auth.strategy(AUTH_STRATEGY, AUTH_SCHEME, options);
}

export default {
  name: NAME,
  register,
};
