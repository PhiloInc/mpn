import Joi from 'joi';
import Boom from 'boom';

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

  return async function authenticate(request, reply) {
    const authorization = request.raw.req.headers.authorization;
    logger.info(authorization);
    if (!authorization) {
      return reply(Boom.unauthorized('Authorization header missing'));
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      return reply(Boom.badRequest('Authorization header invalid'));
    }
    const token = parts[1];
    const username = await sessions.findUsernameByToken(token);
    if (username === null) {
      return reply(Boom.unauthorized('Token not found'));
    }
    return reply.continue({ credentials: { username } });
  };
}

function scheme(server, options) {
  Joi.assert(options, OPTIONS_SCHEMA);

  return {
    authenticate: createAuthenticate(options),
  };
}

function register(server, options, next) {
  Joi.assert(options, OPTIONS_SCHEMA);

  server.auth.scheme(AUTH_SCHEME, scheme);
  server.auth.strategy(AUTH_STRATEGY, AUTH_SCHEME, false, options);

  next();
}

register.attributes = {
  name: NAME,
};

export default register;
