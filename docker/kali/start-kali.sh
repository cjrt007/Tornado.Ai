#!/usr/bin/env bash
set -euo pipefail

USER_NAME=${KALI_USER:-kali}
USER_PASSWORD=${KALI_PASSWORD:-kali}

if id "$USER_NAME" >/dev/null 2>&1; then
  echo "$USER_NAME:$USER_PASSWORD" | chpasswd
fi

if command -v dbus-daemon >/dev/null 2>&1; then
  mkdir -p /var/run/dbus
  dbus-daemon --system --fork || true
fi

/usr/sbin/xrdp-sesman --nodaemon &
sleep 1
exec /usr/sbin/xrdp --nodaemon
