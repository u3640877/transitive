#!/bin/bash

# "source" .env
set -o allexport
. .env
set +o allexport

# Detect Docker Compose (standalone or plugin)
if ( docker-compose > /dev/null 2>&1 ); then
  function compose() {
    docker-compose $@
  }
elif ( docker compose > /dev/null 2>&1 ); then
  function compose() {
    docker compose $@
  }
else
  echo "** Error: you don't appear to have Docker Compose installed."
  echo "Please see https://docs.docker.com/compose/install/."
  exit 1;
fi;

# Detect OS type
OS_TYPE="$(uname)"
if [[ "$OS_TYPE" == "Linux" ]]; then
  if ( ! dpkg -l avahi-daemon > /dev/null 2>&1 ); then
    echo "You don't have avahi-daemon installed. Please run"
    echo " sudo apt-get install -y avahi-daemon"
    echo "and then try again."
    exit 2;
  fi
elif [[ "$OS_TYPE" == "Darwin" ]]; then
  echo "Detected macOS. Bonjour is required (pre-installed on macOS)."
else
  echo "Unsupported OS: $OS_TYPE"
  exit 3
fi

# Docker daemon check (cross-platform)
if ! docker info > /dev/null 2>&1; then
  echo "** Error: Cannot connect to the Docker daemon. Is Docker Desktop running?"
  exit 4
fi

# We need to create the certs folder to make sure the generated certs have the
# right owner (see certs/generate.sh).
mkdir -p $TR_VAR_DIR/certs

# For dev: create a folder read by cloud-app where capabilities can be updated live
mkdir -p /tmp/caps

compose build && compose up -d $@

# mDNS verification (platform-specific)
if [[ "$OS_TYPE" == "Darwin" ]]; then
  if dscacheutil -q host -a name random-subdomain-3245234.$TR_HOST > /dev/null 2>&1; then
    echo "mDNS verification successful"
  else
    echo "mDNS verification failed. Please follow the instructions in"
    echo "https://github.com/transitiverobotics/transitive/blob/main/cloud/tools/mDNS/README.md"
  fi
else
  if getent hosts random-subdomain-3245234.$TR_HOST > /dev/null 2>&1; then
    echo "mDNS verification successful"
  else
    echo "mDNS verification failed. Please follow the instructions in"
    echo "https://github.com/transitiverobotics/transitive/blob/main/cloud/tools/mDNS/README.md"
  fi
fi
