#!/bin/bash

docker run --rm -v $KHS_HOST_DB_PATH:/app/db --env-file $KHS_HOST_ENV_FILE kolding-horing-scraper

