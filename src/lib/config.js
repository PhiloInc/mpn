import { readFileSync } from 'fs';

const configuration = {
  alwaysAuth: false,
  logType: 'stdout',
  origin: {
    host: 'registry.npmjs.org',
    port: 443,
    protocol: 'https',
  },
  port: 3002,
  mpnDir: '/opt/mpn/',
};

const overrides = new Map([
  ['ALWAYS_AUTH', 'alwaysAuth'],
  ['MPN_DIR', 'mpnDir'],
  ['MPN_LOG', 'logType'],
  ['NPM_ORIGIN', 'origin'],
  ['PORT', 'port'],
]);

function set(object) {
  for (const [source, destination] of overrides) {
    if (object.hasOwnProperty(source)) {
      configuration[destination] = object[source];
    }
  }
}

// Read external configuration file if provided
const configurationFile = process.env.MPN_CONFIG;
try {
  if (configurationFile) {
    const data = readFileSync(configurationFile, {
      encoding: 'utf8',
    });
    set(JSON.parse(data));
  }
} catch (error) {
  throw new Error(`Error reading ${configurationFile}: ${error}`);
}

// Override with environment
set(process.env);

export default configuration;
