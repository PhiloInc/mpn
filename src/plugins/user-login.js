import createLogger from '../lib/logger-factory';
const logger = createLogger('packageFile');

import { authenticate } from '../authentication/htpasswd';
import { createToken } from '../authentication/tokens';

import Joi from 'joi';

async function handler(request, reply) {
  const username = request.payload.name;
  const password = request.payload.password;
  try {
    const success = await authenticate(username, password);
    if (!success) {
      logger.info(`Login failed for ${username}`);
      return reply(false).code(401);
    }
    logger.info(`Login success for ${username}`);
    const token = await createToken(username);
    logger.info(`Created ${token} for ${username}`);
    return reply({ token }).code(201);
  } catch (error) {
    logger.error(error, `Error with login for ${username}`);
    return reply(error);
  }
}

function register(server, options, next) {
  server.route({
    method: 'PUT',
    path: '/-/user/{user}',
    handler,
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
  name: 'user-login',
  version: '1.0.0',
};

export default register;
