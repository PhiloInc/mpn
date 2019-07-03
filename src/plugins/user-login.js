import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { AUTHENTICATION_SCHEMA, LOGGER_SCHEMA, SESSIONS_SCHEMA } from '../lib/schema';

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

  return async function handler(request, response) {
    const { name: username, password } = request.payload;
    const success = await authentication.authenticate(username, password);
    if (!success) {
      logger.info(`${username} login failed`);
      throw Boom.unauthorized();
    }
    logger.info(`${username} login success`);
    const token = await sessions.createToken(username);
    logger.info(`${username} created token ${token}`);
    return response.response({ token }).code(201);
  };
}

async function register(server, options) {
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
          email: Joi.string()
            .email()
            .required(),
          type: Joi.string().required(),
          roles: Joi.array().required(),
          date: Joi.date()
            .iso()
            .required(),
        },
      },
    },
  });
}

export default {
  name: NAME,
  register,
};
