FROM minio/minio:latest

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["minio server --address [::]:${MINIO_PRIVATE_PORT:-9000} ${RAILWAY_VOLUME_MOUNT_PATH:-/data}"]
