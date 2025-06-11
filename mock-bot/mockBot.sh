#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
set -a; source .env; set +a

# 1) enable dev-mode so index.js skips the install-location check
export TR_DEVMODE=1

# 2) also symlink into ~/.transitive/node_modules so you can inspect as if installed
export TRANSITIVE_HOME=$HOME/.transitive
mkdir -p "$TRANSITIVE_HOME/node_modules/@transitive-robotics"
ln -sf /mnt/d/research/transitive/robot-agent \
      "$TRANSITIVE_HOME/node_modules/@transitive-robotics/robot-agent"

# now install & run
cd /mnt/d/research/transitive/robot-agent
npm install
npm start