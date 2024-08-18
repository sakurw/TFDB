#!/bin/bash
cd /etc/tfdb_ap/AP || exit 1
source /etc/tfdb_ap/venv/bin/activate
exec gunicorn --bind 0.0.0.0:8000 --log-level debug main:app
