# Cloud + MockBot Local Development

This guide shows you how to bring up the Transitive Cloud stack locally and connect your MockBot device.

## Architecture Overview

The setup uses two MQTT brokers connected via a bridge:
- **MockBot Broker**: Runs on port 18883, your robot agent connects here
- **Cloud Broker**: Runs on port 28883 as part of the cloud stack
- **Bridge**: Forwards messages between the two brokers

## Prerequisites

- Docker & Docker Compose  
- WSL2 (or Linux/macOS shell)  
- Node.js & npm (for MockBot)  

## 1. Start Your Mosquitto Broker

From your `mock-bot/` folder:

```bash
cd /mnt/d/Research/transitive/mock-bot
# stop any previous instance
docker stop mock-mqtt 2>/dev/null && docker rm mock-mqtt 2>/dev/null

# check if port 18883 is in use and kill the process if needed
sudo lsof -i :18883
sudo kill <pid>

# launch broker on host port 18883
docker run -d --name mock-mqtt \
  -p 18883:18883 \
  -v $PWD/certs:/mosquitto/certs \
  -v $PWD/config-bridge:/mosquitto/config/bridge \
  -v $PWD/config-main/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

Verify it's listening:

```bash
docker ps --filter name=mock-mqtt
# or on the host:
ss -tulpn | grep :18883
```

## 2. Configure Your Cloud `.env`

In `d:\Research\transitive\cloud`:

```bash
cd /mnt/d/Research/transitive/cloud
cp sample.env .env
```

Edit `.env` and set:

```properties
# filepath: d:\Research\transitive\cloud\.env
MONGO_URL=mongodb://mongodb
MONGO_DB=transitive

# MQTT URL for cloud components
TR_MQTT_URL=mqtts://localhost:28883

# where certificates are located
TR_MQTT_TLS_CA=/app/certs/ca.crt

# your UI hostname/port
TR_HOST=localhost

# your superuser
TR_USER=superadmin
TR_PASS=some-very-secure-password

# local dev mode
PRODUCTION=false
COMPOSE_PROFILES=dev
```

Copy the MockBot CA into the Cloud certs folder:

```bash
mkdir -p ${TR_VAR_DIR:-.}/certs
cp ../mock-bot/certs/ca.crt ${TR_VAR_DIR:-.}/certs/
```

## 3. Start the Cloud Stack

Bring up the dev-profile services:

```bash
cd /mnt/d/Research/transitive/cloud
docker-compose --profile dev up -d
```
restart
```bash
cd d:\Research\transitive\cloud
docker-compose --profile dev up -d --build cloud_dev
```

You should see at least:

- `mosquitto_dev` on `0.0.0.0:28883→8883/tcp`  
- `proxy` on `0.0.0.0:80→80/tcp`  

Verify with:

```bash
docker-compose --profile dev ps
```

## 4. Configure Robot Agent

Ensure your `mock-bot/.env` points to the MockBot broker:

```properties
# filepath: d:\Research\transitive\mock-bot\.env
TR_USERID=mockuser
TR_DEVICEID=mockbot001

# your local broker (agent will connect here)
TR_HOST=localhost:18883
TR_MQTT_URL=mqtts://localhost:18883

# CA certificate location
NODE_EXTRA_CA_CERTS=/mnt/d/research/transitive/mock-bot/certs/ca.crt

# DEVELOPMENT ONLY - Disables certificate validation
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 5. Start the Robot Agent

Run the MockBot agent:

```bash
cd /mnt/d/Research/transitive/mock-bot
./mockBot.sh
```

## 6. Browse the UI

Open in your browser:

```
http://localhost
```

Log in as `superadmin` (or register), then go to **Devices → Add Devices**. Your MockBot (`mockbot001`) should appear automatically.

## 7. Troubleshooting

### Connection Issues
- Verify both MQTT brokers are running:
  ```bash
  # Check MockBot broker
  docker logs mock-mqtt

  # Check Cloud broker
  docker-compose --profile dev logs mosquitto_dev
  ```

### Bridge Connection
- Check if bridge is working properly:
  ```bash
  docker exec mock-mqtt mosquitto_sub -h localhost -p 8883 -t '$SYS/broker/connection/cloud-bridge/state' -v
  ```
  Should show `1` for connected.

## 8. Restarting or Stopping

To stop all services:

```bash
docker-compose --profile dev down
docker stop mock-mqtt && docker rm mock-mqtt
```

To rebuild images or force fresh pulls:

```bash
docker-compose --profile dev pull
docker-compose --profile dev up -d --build
```

Now you have a full local dev environment: MockBot on TLS-8883 talking to Cloud services and UI on `http://localhost`.