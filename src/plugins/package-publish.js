import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { has } from 'lodash';
import { filePath, metadataPath } from '../lib/packages';
import { FORCE_HTTPS_SCHEMA, LOGGER_SCHEMA, STORAGE_SCHEMA } from '../lib/schema';
import { AUTH_STRATEGY } from './npm-token';

const NAME = 'package-publish';

const OPTIONS_SCHEMA = {
  logger: LOGGER_SCHEMA,
  storage: STORAGE_SCHEMA,
  forceHTTPS: FORCE_HTTPS_SCHEMA,
};

function createHandler({ logger: parentLogger, storage, forceHTTPS }) {
  const logger = parentLogger.child({
    context: NAME,
  });

  return async function handler(request, response) {
    const packageName = request.params.name;
    logger.info(packageName);
    if (packageName !== request.payload.name) {
      logger.error(`${packageName} didn't match ${request.payload.name}`);
      throw Boom.badRequest(`${packageName} didn't match ${request.payload.name}`);
    }
    const metadata = {
      ...request.payload,
    };
    delete metadata._attachments;

    // If packages should be pulled via HTTPS force URL scheme
    if (forceHTTPS) {
      Object.keys(metadata.versions).forEach(key => {
        const versionData = metadata.versions[key];
        if (versionData.dist && versionData.dist.tarball) {
          versionData.dist.tarball = versionData.dist.tarball.replace(/^http:/, 'https:');
        }
      });
    }

    const metadataFileName = metadataPath(packageName);
    const result = await storage.readFile(metadataFileName);
    if (result.exists) {
      const existing = JSON.parse(result.data);
      // eslint-disable-next-line no-restricted-syntax
      for (const tag of Object.keys(request.payload['dist-tags'])) {
        const version = request.payload['dist-tags'][tag];
        logger.info(`${packageName} ${version} ${tag} `);
        if (has(existing.versions, version)) {
          logger.error(`${packageName} ${version} ${tag} already exists`);
          throw Boom.conflict(`${packageName} ${version} ${tag} already exists`);
        }
      }
      metadata['dist-tags'] = {
        ...existing['dist-tags'],
        ...metadata['dist-tags'],
      };
      metadata.versions = {
        ...existing.versions,
        ...metadata.versions,
      };
    }

    const attachments = request.payload._attachments;
    // eslint-disable-next-line no-restricted-syntax
    for (const file of Object.keys(attachments)) {
      const fileName = filePath(packageName, file);
      const data = Buffer.from(attachments[file].data, 'base64');
      // eslint-disable-next-line no-await-in-loop
      await storage.writeFile(fileName, data);
    }

    const json = JSON.stringify(metadata, null, '  ');
    await storage.writeFile(metadataFileName, json);
    return response.response(json).type('application/json');
  };
}

async function register(server, options) {
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
}

export default {
  name: NAME,
  register,
};
