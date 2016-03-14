import createLogger from '../lib/logger-factory';
const logger = createLogger('authenticationScheme');

import Boom from 'boom';

import { findUsernameByToken } from '../sessions/tokens-object';

export const AUTH_SCHEME = 'npm-token';
export const AUTH_STRATEGY = 'npmToken';

async function authenticate(request, reply) {
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
  const username = await findUsernameByToken(token);
  if (username === null) {
    return reply(Boom.unauthorized('Token not found'));
  }
  return reply.continue({ credentials: { username } });
}

function scheme() {
  return {
    authenticate,
  };
}

function register(server, options, next) {
  server.auth.scheme(AUTH_SCHEME, scheme);
  server.auth.strategy(AUTH_STRATEGY, AUTH_SCHEME);
  next();
}

register.attributes = {
  name: 'npm-token',
  version: '1.0.0',
};

export default register;
