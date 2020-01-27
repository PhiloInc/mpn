import Joi from '@hapi/joi';

export const FORCE_HTTPS_SCHEMA = Joi.boolean().required();

export const SLACK_WEB_HOOK_SCHEMA = Joi.string().optional();

export const ALWAYS_AUTH_SCHEMA = Joi.boolean().required();

export const BASE_DIRECTORY_SCHEMA = Joi.string().required();

export const LOGGER_SCHEMA = Joi.object().required();

export const SESSIONS_SCHEMA = Joi.object()
  .keys({
    createToken: Joi.func()
      .arity(1)
      .required(),
    findUsernameByToken: Joi.func()
      .arity(1)
      .required(),
  })
  .unknown(true);

export const AUTHENTICATION_SCHEMA = Joi.object()
  .keys({
    authenticate: Joi.func()
      .arity(2)
      .required(),
  })
  .unknown(true);

export const STORAGE_SCHEMA = Joi.object()
  .keys({
    readFile: Joi.func()
      .arity(1)
      .required(),
    readStream: Joi.func()
      .arity(1)
      .required(),
    writeFile: Joi.func()
      .arity(2)
      .required(),
  })
  .unknown(true);

export const ORIGIN_SCHEMA = Joi.object()
  .keys({
    host: Joi.string().required(),
    port: Joi.number()
      .integer()
      .required(),
    protocol: Joi.string().required(),
  })
  .unknown(true);
