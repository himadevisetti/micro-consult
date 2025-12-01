#!/bin/bash
while IFS='=' read -r key value; do
  # strip carriage returns and whitespace
  key=$(echo "$key" | tr -d '\r' | xargs)
  # skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  echo "$key"
done < expert-snapshot-legal/frontend/.env
