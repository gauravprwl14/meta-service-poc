#!/bin/sh

# Check if environment name and app name are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <environment_name> <app_name>"
    exit 1
fi

ENV_NAME=$1
APP_NAME=$2

echo "Applying deployment for $APP_NAME in environment: $ENV_NAME"

# Add your apply logic here
# Example:
# terraform apply -var="env_name=$ENV_NAME" -var="app_name=$APP_NAME" -auto-approve

exit 0 