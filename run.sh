#!/bin/bash
SCRIPT=$(realpath $0)
SCRIPTPATH=$(dirname $SCRIPT)

docker run --rm -v $SCRIPTPATH:/app/db --env-file $SCRIPTPATH/.env kolding-horing-scraper

