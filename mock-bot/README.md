# MockBot (Local Robot-Agent)

This guide shows you how to configure and run a local “mock” robot‐agent that connects to a Mosquitto broker on your machine. You can easily adapt the paths and ports to suit other environments.

## Prerequisites

- WSL2 (or a Unix-like shell) on Windows, or any Linux/macOS terminal  
- Docker (for Mosquitto)  
- Node.js & npm (v16+)  
- `openssl`, `chmod`, `bash`

## Folder Layout

```
d:\Research\transitive\
├── robot-agent\        ← your cloned/workspace robot-agent  
└── mock-bot\
    ├── certs\          ← generated TLS certs  
    ├── .env            ← environment overrides  
    ├── mosquitto.conf  ← broker config  
    ├── mockBot.sh      ← launcher script  
    └── README.md       ← this file
```

## 1. Configure `.env`

Open `mock-bot/.env` and set:

```env
# filepath: d:\Research\transitive\mock-bot\.env

# your user & device identifiers:
TR_USERID=mockuser
TR_DEVICEID=mockbot001

# host:port for your local MQTT broker:
TR_HOST=localhost:8883

# path to CA cert (absolute on WSL):
NODE_EXTRA_CA_CERTS=/mnt/d/Research/transitive/mock-bot/certs/ca.crt
```

If your repo lives elsewhere, update the `NODE_EXTRA_CA_CERTS` accordingly:
- Windows path under WSL: `/mnt/<drive>/<path>/mock-bot/certs/ca.crt`  
- Native Linux: `/home/you/Research/transitive/mock-bot/certs/ca.crt`

## 2. Tweak `mockBot.sh`

By default `mockBot.sh` symlinks your local `robot-agent` into `~/.transitive/node_modules` and enables `TR_DEVMODE`.  
If your workspace is elsewhere, edit:

```bash
# filepath: d:\Research\transitive\mock-bot\mockBot.sh

# change this to point at your local checkout:
ROB_AGENT_DIR=/mnt/d/Research/transitive/robot-agent

# …later…
ln -sf "$ROB_AGENT_DIR" \
  "$TRANSITIVE_HOME/node_modules/@transitive-robotics/robot-agent"

# and cd into:
cd "$ROB_AGENT_DIR"
```

You can also disable `TR_DEVMODE` if you want the agent to enforce its normal install-location checks.

Don’t forget to make it executable:

```bash
chmod +x mock-bot/mockBot.sh
```

## 3. Review `mosquitto.conf`

Check `mock-bot/mosquitto.conf`—it expects to find your certs in the container at:

```conf
# filepath: d:\Research\transitive\mock-bot\mosquitto.conf

listener 8883
cafile /mosquitto/config/ca.crt
certfile /mosquitto/config/server.crt
keyfile /mosquitto/config/server.key
require_certificate false
```

If you want a different host port, change the `listener` line and remap below.

## 4. Run the Mosquitto Broker

From the `mock-bot` folder:

```bash
cd /mnt/d/Research/transitive/mock-bot

docker run -d --name mock-mqtt \
  -p 8883:8883 \
  -v $PWD/certs:/mosquitto/config \
  -v $PWD/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

- To free port 8883, stop any existing container bound there first:  
  ```bash
  docker stop mock-mqtt && docker rm mock-mqtt
  ```
- Or choose another host port, e.g. `-p 18883:8883`, then update `TR_HOST=localhost:18883` in `.env`.

## 5. Launch the MockBot

```bash
cd /mnt/d/Research/transitive/mock-bot
./mockBot.sh
```

You should see:

- `npm install` & `npm start` run inside `robot-agent/`
- The agent connect over TLS to your local broker
- Heartbeat/info topics appear under `/<TR_USERID>/<TR_DEVICEID>/…`

---

That’s it! Now you can develop or test your robot-agent locally—just tweak paths & ports in the three files above to fit any machine.<!-- filepath: d:\Research\transitive\mock-bot\README.md -->

# MockBot (Local Robot-Agent)

This guide shows you how to configure and run a local “mock” robot‐agent that connects to a Mosquitto broker on your machine. You can easily adapt the paths and ports to suit other environments.

## Prerequisites

- WSL2 (or a Unix-like shell) on Windows, or any Linux/macOS terminal  
- Docker (for Mosquitto)  
- Node.js & npm (v16+)  
- `openssl`, `chmod`, `bash`

## Folder Layout

```
d:\Research\transitive\
├── robot-agent\        ← your cloned/workspace robot-agent  
└── mock-bot\
    ├── certs\          ← generated TLS certs  
    ├── .env            ← environment overrides  
    ├── mosquitto.conf  ← broker config  
    ├── mockBot.sh      ← launcher script  
    └── README.md       ← this file
```

## 1. Configure `.env`

Open `mock-bot/.env` and set:

```env
# filepath: d:\Research\transitive\mock-bot\.env

# your user & device identifiers:
TR_USERID=mockuser
TR_DEVICEID=mockbot001

# host:port for your local MQTT broker:
TR_HOST=localhost:8883

# path to CA cert (absolute on WSL):
NODE_EXTRA_CA_CERTS=/mnt/d/Research/transitive/mock-bot/certs/ca.crt
```

If your repo lives elsewhere, update the `NODE_EXTRA_CA_CERTS` accordingly:
- Windows path under WSL: `/mnt/<drive>/<path>/mock-bot/certs/ca.crt`  
- Native Linux: `/home/you/Research/transitive/mock-bot/certs/ca.crt`

## 2. Tweak `mockBot.sh`

By default `mockBot.sh` symlinks your local `robot-agent` into `~/.transitive/node_modules` and enables `TR_DEVMODE`.  
If your workspace is elsewhere, edit:

```bash
# filepath: d:\Research\transitive\mock-bot\mockBot.sh

# change this to point at your local checkout:
ROB_AGENT_DIR=/mnt/d/Research/transitive/robot-agent

# …later…
ln -sf "$ROB_AGENT_DIR" \
  "$TRANSITIVE_HOME/node_modules/@transitive-robotics/robot-agent"

# and cd into:
cd "$ROB_AGENT_DIR"
```

You can also disable `TR_DEVMODE` if you want the agent to enforce its normal install-location checks.

Don’t forget to make it executable:

```bash
chmod +x mock-bot/mockBot.sh
```

## 3. Review `mosquitto.conf`

Check `mock-bot/mosquitto.conf`—it expects to find your certs in the container at:

```conf
# filepath: d:\Research\transitive\mock-bot\mosquitto.conf

listener 8883
cafile /mosquitto/config/ca.crt
certfile /mosquitto/config/server.crt
keyfile /mosquitto/config/server.key
require_certificate false
```

If you want a different host port, change the `listener` line and remap below.

## 4. Run the Mosquitto Broker

From the `mock-bot` folder:

```bash
cd /mnt/d/Research/transitive/mock-bot

docker run -d --name mock-mqtt \
  -p 8883:8883 \
  -v $PWD/certs:/mosquitto/config \
  -v $PWD/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

- To free port 8883, stop any existing container bound there first:  
  ```bash
  docker stop mock-mqtt && docker rm mock-mqtt
  ```
- Or choose another host port, e.g. `-p 18883:8883`, then update `TR_HOST=localhost:18883` in `.env`.

## 5. Launch the MockBot

```bash
cd /mnt/d/Research/transitive/mock-bot
./mockBot.sh
```

You should see:

- `npm install` & `npm start` run inside `robot-agent/`
- The agent connect over TLS to your local broker
- Heartbeat/info topics appear under `/<TR_USERID>/<TR_DEVICEID>/…`

---

That’s it! Now you can develop or test your robot-agent locally—just tweak paths & ports in the three files above to fit any