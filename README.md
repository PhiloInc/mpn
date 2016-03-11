# mpn

My Private NPM

Overview
--------

This project allows you to have your own npm registry.

The inspiration for this project comes from [elephant](https://github.com/dickeyxxx/elephant) which in turn was inspired by [sinopia](https://github.com/rlidwka/sinopia).

Setup
-----

The default configuration stores files to the local file system.

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

Configuration
------------

TODO

npm commands supported
----------------------

* `npm install`
* `npm update`
* `npm login`
* `npm whoami` (TODO)
* `npm publish` (TODO)

Authentication
--------------

The default authentication mechanism is htpasswd files.

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
