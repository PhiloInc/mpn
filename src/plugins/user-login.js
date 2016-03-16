import Joi from 'joi';
import Boom from 'boom';

import { LOGGER_SCHEMA, SESSIONS_SCHEMA, AUTHENTICATION_SCHEMA } from '../lib/schema';

const NAME = 'user-login';

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  sessions: SESSIONS_SCHEMA,
  authentication: AUTHENTICATION_SCHEMA,
};

function createHandler({ logger: parentLogger, authentication, sessions }) {
  const logger = parentLogger.child({
    context: NAME,
  });

  return async function handler(request, reply) {
    const username = request.payload.name;
    const password = request.payload.password;
    const success = await authentication.authenticate(username, password);
    if (!success) {
      logger.info(`${username} login failed`);
      return reply(Boom.unauthorized());
    }
    logger.info(`${username} login success`);
    const token = await sessions.createToken(username);
    logger.info(`${username} created token ${token}`);
    return reply({ token }).code(201);
  };
}

function register(server, options, next) {
  Joi.assert(options, OPTIONS_SCHEMA);

  server.route({
    method: 'PUT',
    path: '/-/user/{user}',
    handler: createHandler(options),
    config: {
      validate: {
        payload: {
          _id: Joi.string().required(),
          name: Joi.string().required(),
          password: Joi.string().required(),
          email: Joi.string().email().required(),
          type: Joi.string().required(),
          roles: Joi.array().required(),
          date: Joi.date().iso().required(),
        },
      },
    },
  });

  next();
}

register.attributes = {
  name: NAME,
};

export default register;
