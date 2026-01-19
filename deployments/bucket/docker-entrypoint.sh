#!/bin/sh
set -eu

MINIO_PORT="${MINIO_PRIVATE_PORT:-9000}"
DATA_PATH="${RAILWAY_VOLUME_MOUNT_PATH:-/data}"

exec minio server --address "[::]:${MINIO_PORT}" "${DATA_PATH}"
