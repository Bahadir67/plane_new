#!/bin/bash
set -e
python manage.py wait_for_db
# Wait for migrations
python manage.py wait_for_migrations

# Create the default bucket
#!/bin/bash

# Collect system information and compute a stable SHA-256 signature.
SIGNATURE=$(
python - <<'PY'
import hashlib
import pathlib
import socket
import subprocess

def read_text(path: str) -> str:
    try:
        return pathlib.Path(path).read_text()
    except Exception:
        return ""

hostname = socket.gethostname()
mac = ""
try:
    for path in pathlib.Path("/sys/class/net").glob("*"):
        if path.name == "lo":
            continue
        addr = (path / "address").read_text().strip()
        if addr:
            mac = addr
            break
except Exception:
    pass

cpu_info = read_text("/proc/cpuinfo")
mem_info = read_text("/proc/meminfo")
try:
    disk_info = subprocess.check_output(["df", "-h"]).decode()
except Exception:
    disk_info = ""

payload = f"{hostname}{mac}{cpu_info}{mem_info}{disk_info}".encode()
print(hashlib.sha256(payload).hexdigest())
PY
)

# Export the variables
export MACHINE_SIGNATURE=$SIGNATURE

# Register instance
python manage.py register_instance "$MACHINE_SIGNATURE"
# Load the configuration variable
python manage.py configure_instance

# Create the default bucket
python manage.py create_bucket

# Clear Cache before starting to remove stale values
python manage.py clear_cache

python manage.py runserver 0.0.0.0:8000 --settings=plane.settings.local
