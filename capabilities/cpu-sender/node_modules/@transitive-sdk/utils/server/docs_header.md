# Robot and Cloud (node.js)

These classes and functions are available via the `@transitive-sdk/utils` npm package and are for use in node.js, i.e., on the robot and the cloud.

#### Example

```js
const mqtt = require('mqtt');
const { MqttSync, getLogger, getPackageVersionNamespace } =
  require('@transitive-sdk/utils');

// create a logger and set log level
const log = getLogger('main');
log.setLevel('debug');

// Read config.versionNamespace from parent package.json to determine which
// version namespace to use: major, minor, or patch (default).
const version = getPackageVersionNamespace();
log.debug(`using version namespace ${version}`);

const MQTT_HOST = 'mqtt://localhost'; // the mqtt server provided by robot-agent
const mqttClient  = mqtt.connect(MQTT_HOST, {
  // set the clientId as required the agent to identify ourselves
  clientId: `${process.env.npm_package_name}/${version}`,
  // Transitive abuses the username (which is not used as such) to convey
  // additional information, here the full version number (for reporting).
  username: JSON.stringify({
    version: process.env.npm_package_version,
  }),
  password: process.env.PASSWORD, // is set by agent in startPackage.sh
});

mqttClient.once('connect', (connack) => {
  log.debug('connected to mqtt broker', connack);

  const mqttSync = new MqttSync({mqttClient, ignoreRetain: true,
    // Slices off the first N fields of the topic, i.e., our client NS
    // "/org/device/@scope/name/version":
    sliceTopic: 5
  });

  // use mqttSync ..

});
```
