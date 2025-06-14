# Simulating a Robot with Robot Data

This guide explains how to use ROS and `mqtt_bridge` to simulate a robot publishing data to an MQTT broker.

## Prerequisites

- ROS (tested on Melodic/Noetic)
- Python 3
- Docker (optional, if you want to run Mosquitto in a container)
- MQTT broker running on `localhost:1883` (can be system Mosquitto or Docker)

## 1. Setup ROS Workspace

```bash
# Create and initialize your catkin workspace
mkdir -p ~/catkin_ws/src
cd ~/catkin_ws/src

# Clone the mqtt_bridge package
git clone https://github.com/groove-x/mqtt_bridge.git

# Install dependencies
cd ~/catkin_ws
rosdep install --from-paths src --ignore-src -r -y

# Build the workspace
catkin_make

# Source the workspace
source devel/setup.bash

# (Optional) Add to your .bashrc for future terminals
echo "source ~/catkin_ws/devel/setup.bash" >> ~/.bashrc
```

## 2. Install Python Dependencies

```bash
pip3 install inject==4.3.1
```

## 3. Start ROS Core

```bash
roscore
```

Leave this running in its own terminal.

## 4. (Optional) Start MQTT Broker

If you do **not** already have Mosquitto running on port 1883, you can start one with Docker:

```bash
docker run -d --name mock-mqtt -p 1883:1883 eclipse-mosquitto
```

Or use your system Mosquitto service.

## 5. Play Back ROS Bag Data (if needed)

If you want to replay a bag file (e.g., to publish `/cpu_value`):

```bash
# In a new terminal, source your workspace
source ~/catkin_ws/devel/setup.bash

# Play a bag file (replace with your file as needed)
rosbag play /mnt/d/Research/transitive/Robot\ Data/area1-2-3.bag
```

## 6. Configure and Start mqtt_bridge

First, ensure the bridge config is loaded:

```bash
# Remove any previous parameters
rosparam delete /mqtt_bridge_node

# Load the bridge configuration
rosparam load /mnt/d/Research/transitive/Robot\ Data/mqtt_bridge.yaml /mqtt_bridge_node
```

Now, start the bridge node:

```bash
rosrun mqtt_bridge mqtt_bridge_node.py
```

You should see output like:
```
mqtt_params: {'connection': {'host': 'localhost', 'port': 1883}}
[INFO] ...: MQTT connected
```

## 7. Verify Data Flow

- The bridge will forward messages from ROS topic `/cpu_value` to MQTT topic `agent/mockbot001/cpu_value`.
- Use an MQTT client to subscribe and verify:
  ```bash
  mosquitto_sub -h localhost -p 1883 -t 'agent/mockbot001/cpu_value'
  ```

## Summary

You are now simulating a robot by replaying ROS bag data and bridging it to MQTT. The cloud or other MQTT consumers can subscribe to `agent/mockbot001/cpu_value` to receive the simulated data.