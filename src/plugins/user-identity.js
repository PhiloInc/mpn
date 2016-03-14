import { AUTH_STRATEGY } from './npm-token';

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
  name: 'user-identity',
  version: '1.0.0',
};

export default register;
