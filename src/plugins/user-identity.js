import { AUTH_STRATEGY } from './npm-token';

const NAME = 'user-identity';

async function handler(request) {
  return request.auth.credentials;
}

async function register(server) {
  server.route({
    method: 'GET',
    path: '/-/whoami',
    handler,
    config: {
      auth: AUTH_STRATEGY,
    },
  });
}

export default {
  name: NAME,
  register,
};
