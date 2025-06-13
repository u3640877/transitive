
const fs = require('fs');
const path = require('path');

const assert = require('assert');
const jwt = require('jsonwebtoken');
const http = require('http');
const https = require('https');

const Mongo = require('./mongo');
const { getRandomId, decodeJWT } = require('../common/common');

const randomId = getRandomId;

// moved to common
// const decodeJWT = (token) => JSON.parse(Buffer.from(token.split('.')[1], 'base64'));

/** set the title of the terminal we are running in */
const setTerminalTitle = (title) => console.log(`\0o33]0;${title}\0o07`);

/** a simple function to fetch a URL */
const fetchURL = (url) => new Promise((resolve, reject) => {
  const protocolHandlers = {http, https};
  const protocol = url.split(':')[0];
  const handler = protocolHandlers[protocol];
  if (!handler) {
    reject(`Unhandled protocol: ${protocol}`);
  }

  handler.get(url, (res) => {
    const { statusCode } = res;

    let error;
    // Any 2xx status code signals a successful response but
    // here we're only checking for 200.
    if (!(200 <= statusCode && statusCode < 300)) {
      // Consume response data to free up memory
      res.resume();
      reject(`HTTP request failed.\nStatus Code: ${statusCode}`);
      return;
    }

    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => { resolve(rawData); });
  }).on('error', (e) => {
      reject(`HTTP request failed: ${e.message}`);
    });
});

/** walk up the directory tree until we find a file or directory called basename
 */
const findPath = (basename) => {
  let lastDir = null;
  let dir = process.cwd();
  while (dir != lastDir) {
    if (fs.existsSync(`${dir}/${basename}`)) {
      return `${dir}/${basename}`;
    }
    lastDir = dir;
    dir = path.dirname(dir);
  }
  return null;
};

const versionScopes = ['major', 'minor', 'patch'];
/** Get from package info the version namespace we should use, e.g.,
`{version: '1.2.3', config.versionNamespace: 'minor'}` => '1.2' */
const getPackageVersionNamespace = () => {
  let versionScope =
    versionScopes.indexOf(process.env.npm_package_config_versionNamespace || 'patch');
  versionScope < 0 && (versionScope = 2);
  return process.env.npm_package_version?.split('.')
      .slice(0, versionScope + 1).join('.');
};

/** Allows you to dynamically import a capability in node.js to use its API there.
 *
 * Example:
 * ```js
 * import { importCapability } from '@transitive-sdk/utils';
 *
 * const run = async () => {
 *   const rosTool = await importCapability({
 *     jwt: 'A_VALID_JWT_FOR_THE_ROS-TOOL_CAPABILITY',
 *   });
 *
 *   // Use ros-tool to subscribe to the ROS /odom topic on the device of the JWT.
 *   // Here "subscribe" is a function exported by the ros-tool capability.
 *   rosTool.subscribe(1, '/odom');
 *
 *   // print data as it changes in the local cache:
 *   rosTool.onData(() =>
 *     console.log(JSON.stringify(
 *       rosTool.deviceData.ros?.[1]?.messages?.odom?.pose?.pose, true, 2)),
 *     'ros/1/messages/odom/pose/pose'
 *   );
 * };
 *
 * run();
 * ```
*/
const importCapability = async (args) => {
  const { jwt, host = 'transitiverobotics.com', ssl = true } = args;

  const {id, device, capability} = decodeJWT(jwt);
  const capName = capability.split('/')[1];

  const baseUrl = `http${ssl ? 's' : ''}://portal.${host}`;
  const params = new URLSearchParams({ userId: id, deviceId: device });
  // filename without extension as we'll try multiple
  const fileBasename = `${baseUrl}/running/${capability}/dist/${capName}-node`;

  // Note: this doesn't work with the .ems.js file, even when renaming to .mjs
  const url = `${fileBasename}.js?${params.toString()}`
  // maybe: check cache (tmp folder), send if-modified-since header
  const cjs = await fetch(url);

  const buffer = await cjs.arrayBuffer();
  const tmp = fs.mkdtempSync('/tmp/trCapImport-');
  const fileName = `${tmp}/${capName}-node.js`;
  fs.writeFileSync(fileName, Buffer.from(buffer));

  const capModule = await import(fileName);
  return await capModule.default.default({jwt, host, ssl});
};

module.exports = Object.assign({}, {
  findPath, getPackageVersionNamespace,
  randomId, setTerminalTitle, fetchURL,
  Mongo, importCapability
});
