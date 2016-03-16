# mpn

My Private NPM

## Overview

An easy way to publish and use private modules with npm while using another registry for public modules.

The inspiration for this project comes from [elephant](https://github.com/dickeyxxx/elephant) which in turn was inspired by [sinopia](https://github.com/rlidwka/sinopia).

This project has only been tested with `node` v5.6.0 and `npm` v3.6.0.

The server is designed to be extended with additional options for data storage, authentication, and session management but at present only a MVP has been implemented. [Contributions welcome](#contributing).

## Setup

The default configuration requires authentication (using an htpasswd file) and uses the the local file system (storing data under /opt/mpn).

```
$ git clone https://github.com/NeoPhi/mpn.git
$ cd mpn
$ npm install
$ mkdir -p /opt/mpn/authentication
$ htpasswd -nB USERNAME > /opt/mpn/authentication/htpasswd
$ npm start
```

The registry is now setup and you should be able to login and use it. `npm` will store a login token in `~/.npmrc`. `npm` requires an email but `mpn` ignores it.

```
$ npm login --registry http://localhost:3002
Username: USERNAME
Password:
Email: (this IS public) IGNORED
$ npm whoami --registry http://localhost:3002
USERNAME
$ npm install lodash --registry http://localhost:3002
$ cd ../mymodule
$ npm publish --registry http://localhost:3002
```

To precompile the code for running in a production environment:

```
$ npm run dist
$ node dist/server.js
```

## Configuration

To avoid needing to specify `--registry` with every command you can use [`npm config`](https://docs.npmjs.com/misc/config) to default it globally or on a per project basis.

To override `mpn` defaults create an `overrides.json` file and startup the server setting a `MPN_OVERRIDES` environment variable:

```
$ env MPN_OVERRIDES=/path/overrides.json npm start
```

Values that can be specified in the overrides file include:

* alwaysAuth
  * boolean (default: true)
  * all operations require a user to be logged in
* baseDirectory
  * string (default: '/opt/mpn')
  * base directory for storing files
* logType
  * string (default: 'stdout')
  * `stdout` will use STDOUT, any other value will be treated as a path and a log file created
* origin
  * object with following keys
  * host
    * string (default: 'registry.npmjs.org')
    * host of upstream NPM registry
  * port
    * integer (default: 443)
    * port of upstream NPM registry
  * protocol
    * string (default: 'https')
    * protocol of upstream NPM registry
* port
  * integer (default: 3002)
  * port server will run on

Additionally the following environment variables will override any previously set value

* PORT
  * port server will run on

## Supported commands

* `npm install`
* `npm update`
* `npm login`
* `npm whoami`
* `npm publish`

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/NeoPhi/mpn/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

Bug reports and pull requests are welcome.

## License

[MIT](https://github.com/NeoPhi/mpn/blob/master/LICENSE)
