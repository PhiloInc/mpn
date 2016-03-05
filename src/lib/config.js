import { readFileSync } from 'fs';

const configuration = {
  logType: 'stdout',
  origin: 'https://registry.npmjs.org',
  port: 3002,
  mpnDir: '/opt/mpn/',
};

const overrides = new Map([
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
