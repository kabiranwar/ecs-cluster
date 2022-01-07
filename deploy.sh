#!/usr/bin/env bash

##
# Get settings from CDK JSON file
##
echo "TARGET_ENVIRONMENT :" ${1}
make prepare-environment ENV="${1}"



##
# Run the deployment stack
##
make deploy-stack