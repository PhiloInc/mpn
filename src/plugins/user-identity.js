async function handler(request, reply) {
  return reply(request.auth.credentials);
}

function register(server, options, next) {
  server.route({
    method: 'GET',
    path: '/-/whoami',
    handler,
    config: {
      auth: 'npmToken',
    },
  });

  next();
}

register.attributes = {
  name: 'user-identity',
  version: '1.0.0',
};

export default register;
