// DR: Based on: https://raw.githubusercontent.com/jdxcode/htpasswd-auth/master/index.js
import crypt from 'apache-crypt';
import md5 from 'apache-md5';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

function sha1(password) {
  const hash = crypto.createHash('sha1');
  hash.update(password);
  return hash.digest('base64');
}

function checkPassword(digest, password) {
  return new Promise((fulfill, reject) => {
    if (digest.substr(0, 6) === '$apr1$') {
      fulfill(digest === md5(password, digest));
    } else if (digest.substr(0, 4) === '$2y$') {
      const digest2 = `$2a$${digest.substr(4)}`;
      bcrypt.compare(password, digest2, (err, res) => {
        if (err) {
          reject(err);
        } else {
          fulfill(res);
        }
      });
    } else if (digest.substr(0, 5) === '{SHA}') {
      fulfill(`{SHA}${sha1(password)}` === digest);
    } else if (digest === password) {
      fulfill(true);
    } else {
      fulfill(crypt(password, digest) === digest);
    }
  });
}

export function authenticate(username, password, htpasswd) {
  return new Promise(fulfill => {
    const lines = htpasswd.split('\n');
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts[0] === username) {
        fulfill(checkPassword(parts[1], password));
      }
    });
    fulfill(false);
  });
}
