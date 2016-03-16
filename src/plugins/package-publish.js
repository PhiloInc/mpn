import Boom from 'boom';
import Joi from 'joi';

import { AUTH_STRATEGY } from './npm-token';
import { metadataPath, filePath } from '../lib/packages';
import { LOGGER_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';

const NAME = 'package-publish';

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  storage: STORAGE_SCHEMA,
};

function createHandler({ logger: parentLogger, storage }) {
  const logger = parentLogger.child({
    context: NAME,
  });

  return async function handler(request, reply) {
    const packageName = request.params.name;
    logger.info(packageName);
    if (packageName !== request.payload.name) {
      return reply(Boom.badRequest(`${packageName} didn't match ${request.payload.name}`));
    }
    const metadata = {
      ...request.payload,
    };
    delete metadata._attachments;

    const metadataFileName = metadataPath(packageName);
    const result = await storage.readFile(metadataFileName);
    if (result.exists) {
      const existing = JSON.parse(result.data);
      const version = request.payload['dist-tags'].latest;
      logger.info(`${packageName} ${version}`);
      if (existing.versions.hasOwnProperty(version)) {
        return reply(Boom.conflict(`${packageName} ${version} alreasy exists`));
      }
      metadata.versions = {
        ...existing.versions,
        ...metadata.versions,
      };
    }

    const attachments = request.payload._attachments;
    for (const file of Object.keys(attachments)) {
      const fileName = filePath(packageName, file);
      const data = new Buffer(attachments[file].data, 'base64');
      await storage.writeFile(fileName, data);
    }

    const json = JSON.stringify(metadata, null, '  ');
    await storage.writeFile(metadataFileName, json);
    return reply(json).type('application/json');
  };
}

function register(server, options, next) {
  Joi.assert(options, OPTIONS_SCHEMA);

  server.route({
    method: 'PUT',
    path: '/{name}',
    handler: createHandler(options),
    config: {
      auth: AUTH_STRATEGY,
      validate: {
        payload: {
          _id: Joi.string().required(),
          name: Joi.string().required(),
          description: Joi.string().required(),
          'dist-tags': Joi.object().required(),
          versions: Joi.object().required(),
          readme: Joi.string().required(),
          _attachments: Joi.object().required(),
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
