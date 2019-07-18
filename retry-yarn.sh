#!/bin/sh
set -e

max_retries=5
retry_count=0

until [ "$retry_count" -ge "$max_retries" ]
do
  yarn install && break
  retry_count=$((retry_count+1))
  echo "Retrying yarn install... ($retry_count/$max_retries)"
  sleep 5
done

if [ "$retry_count" -eq "$max_retries" ]; then
  echo "Yarn install failed after $max_retries attempts."
  exit 1
fi

