FROM minio/minio:latest

CMD ["sh", "-c", "minio server --address [::]:${MINIO_PRIVATE_PORT:-9000} ${RAILWAY_VOLUME_MOUNT_PATH:-/data}"]
