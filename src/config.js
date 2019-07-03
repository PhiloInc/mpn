import { readFileSync } from 'fs';
import { has } from 'lodash';
import pino from 'pino';
import HtpasswdAuthentication from './authentication/htpasswd';
import TokensObjectSessions from './sessions/tokens-object';
import FileSystemStorage from './storage/file-system';

const options = {
  alwaysAuth: true,
  baseDirectory: '/opt/mpn',
  logType: 'stdout',
  origin: {
    host: 'registry.npmjs.org',
    port: 443,
    protocol: 'https',
    passThrough: true,
  },
  port: 3002,
  storageType: 'FileSystem',
  authenticationType: 'Htpasswd',
  sessionsType: 'TokensObject',
  umask: 0o0022,
  forceHTTPS: true,
};

const OVERRIDES_FILE = process.env.MPN_OVERRIDES;
try {
  if (OVERRIDES_FILE) {
    const overrides = JSON.parse(
      readFileSync(OVERRIDES_FILE, {
        encoding: 'utf8',
      }),
    );
    Object.assign(options, overrides);
  }
} catch (error) {
  throw new Error(`Error reading ${OVERRIDES_FILE}: ${error}`);
}

const environmentMappings = new Map([
  [
    'PORT',
    {
      destination: 'port',
      conversion: value => parseInt(value, 10),
    },
  ],
]);

// eslint-disable-next-line no-restricted-syntax
for (const [source, { destination, conversion }] of environmentMappings) {
  if (has(process.env, source)) {
    options[destination] = conversion(process.env[source]);
  }
}

const pinoDestination = pino.destination(
  options.logType === 'stdout' ? undefined : options.logType,
);
const logger = pino({ name: 'mpn' }, pinoDestination);

let storage;
if (options.storageType === 'FileSystem') {
  storage = new FileSystemStorage({
    baseDirectory: options.baseDirectory,
    logger,
  });
}

let authentication;
if (options.authenticationType === 'Htpasswd') {
  authentication = new HtpasswdAuthentication({
    logger,
    storage,
  });
}

let sessions;
if (options.sessionsType === 'TokensObject') {
  sessions = new TokensObjectSessions({
    logger,
    storage,
  });
}

const configuration = {
  alwaysAuth: options.alwaysAuth,
  logger,
  origin: options.origin,
  port: options.port,
  storage,
  authentication,
  sessions,
  forceHTTPS: options.forceHTTPS,
  pinoDestination,
};

export default configuration;
