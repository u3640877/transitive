'use strict';

const mqtt = require('mqtt');
const os = require('os');
global.DEVICE_ID = process.env.TR_DEVICEID || os.hostname();
const { MqttSync, getLogger, getPackageVersionNamespace } = require('@transitive-sdk/utils');

const log = getLogger('cpu-sender');
log.setLevel('debug');

const version = getPackageVersionNamespace();
const MQTT_HOST = process.env.TR_MQTT_URL || 'mqtt://localhost';
const AGENT_CPU_VALUE_TOPIC = `agent/${global.DEVICE_ID}/cpu_value`;
// Topic to publish consolidated CPU data
const PUBLISH_CPU_TOPIC = '/device/cpu';

let currentAgentCpuUsage = 0; // Default CPU usage

const mqttClient = mqtt.connect(MQTT_HOST, {
  clientId: `${process.env.npm_package_name}/${version}`,
  username: JSON.stringify({
    version: process.env.npm_package_version,
  }),
  password: process.env.PASSWORD,
});

mqttClient.on('connect', () => {
  log.info('Connected to MQTT broker');

  // Subscribe to the topic where the agent will send CPU data
  mqttClient.subscribe(AGENT_CPU_VALUE_TOPIC, (err) => {
    if (err) {
      log.error(`Failed to subscribe to ${AGENT_CPU_VALUE_TOPIC}:`, err);
    } else {
      log.info(`Subscribed to ${AGENT_CPU_VALUE_TOPIC} for CPU updates from agent.`);
    }
  });

  setInterval(() => {
    // Use the CPU usage value received from the agent
    const cpuUsage = currentAgentCpuUsage;

    const payload = {
      device: global.DEVICE_ID,
      cpuUsage,
      timestamp: new Date().toISOString(),
    };

    mqttClient.publish(PUBLISH_CPU_TOPIC, JSON.stringify(payload));
    log.info(`Published CPU usage to ${PUBLISH_CPU_TOPIC}`, payload);
  }, 5000); // every 5 seconds
});

mqttClient.on('message', (topic, message) => {
  if (topic === AGENT_CPU_VALUE_TOPIC) {
    try {
      const receivedData = JSON.parse(message.toString());
      if (typeof receivedData.value === 'number' && receivedData.value >= 0 && receivedData.value <= 100) {
        currentAgentCpuUsage = Math.round(receivedData.value);
        log.debug(`Received CPU usage from agent: ${currentAgentCpuUsage}`);
      } else {
        log.warn(`Received invalid CPU usage value from agent: ${message.toString()}`);
      }
    } catch (e) {
      log.error(`Error parsing CPU usage message from agent: ${message.toString()}`, e);
    }
  }
});

mqttClient.on('error', (err) => {
  log.error('MQTT error:', err);
});