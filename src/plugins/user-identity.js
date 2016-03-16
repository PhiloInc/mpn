import { AUTH_STRATEGY } from './npm-token';

const NAME = 'user-identity';

async function handler(request, reply) {
  return reply(request.auth.credentials);
}

function register(server, options, next) {
  server.route({
    method: 'GET',
    path: '/-/whoami',
    handler,
    config: {
      auth: AUTH_STRATEGY,
    },
  });

  next();
}

register.attributes = {
  name: NAME,
};

export default register;
