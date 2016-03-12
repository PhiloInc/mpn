# mpn

My Private NPM

## Overview

An easy way to publish and use private modules with npm while using another registry for public modules.

The inspiration for this project comes from [elephant](https://github.com/dickeyxxx/elephant) which in turn was inspired by [sinopia](https://github.com/rlidwka/sinopia).

This project has only been tested with npm version 3.6.0.

## Setup

The default configuration uses the the local file system.

```
$ git clone https://github.com/NeoPhi/mpn.git
$ cd mpn
$ npm install
$ mkdir /tmp/mpn
$ env MPN_DIR=/tmp/mpn npm start
```

Your registry is now setup and you should be able to test it:

```
$ npm install lodash --registry http://localhost:3002
```

## Configuration

TODO

## npm commands supported

* `npm install`
* `npm update`
* `npm login`
* `npm whoami` (TODO)
* `npm publish` (TODO)

## Authentication

The default authentication mechanism is an htpasswd file.

```
$ mkdir /tmp/mpn/authentication
$ htpasswd -nB YOURUSERNAME >> /tmp/mpn/authentication
```

Then you can login with npm, which stores the credentials in `~/.npmrc`. The CLI login process requires an email but mpn ignores it.

```
$ npm login --registry http://localhost:3002
Username: danielr
Password:
Email: (this IS public) danielr@neophi.com
$ npm whoami --registry http://localhost:3002
danielr
```

You can now use `npm publish` to publish packages.

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/NeoPhi/mpn/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

Bug reports and pull requests are welcome.

## License

[MIT](https://github.com/NeoPhi/mpn/blob/master/LICENSE)
