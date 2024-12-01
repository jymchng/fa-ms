#!/bin/bash

# Check if correct number of arguments were provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 [development|production] [clean|noclean]"
    exit 1
fi

# Get parameters
ENV=$1
CLEAN=$2

# Validate environment parameter
if [[ "$ENV" != "development" && "$ENV" != "production" ]]; then
    echo "Invalid environment specified: $ENV"
    echo "Please specify 'development' or 'production'."
    exit 1
fi

# Set ENV_SHORT based on ENV
if [ "$ENV" = "development" ]; then
    ENV_SHORT="dev"
    # Optional: export it if needed in subshells or external scripts
else
    ENV_SHORT="prod"
fi

# Define file and environment file based on the environment
COMPOSE_FILE="docker-compose-$ENV_SHORT.yaml"
ENV_FILE=".env.$ENV"
DB_SECRETS_FILE="secrets/.db.$ENV"

# Define the command prefix with the environment file
COMPOSE_CMD="docker compose --progress plain --env-file $DB_SECRETS_FILE --env-file $ENV_FILE -f $COMPOSE_FILE"

# Check if a clean build is requested
if [ "$CLEAN" == "clean" ]; then
    echo "Performing a clean build and run for $ENV environment..."
    $COMPOSE_CMD down
    docker system prune -af
elif [ "$CLEAN" == "noclean" ]; then
    echo "Performing a standard build and run for $ENV environment..."
    $COMPOSE_CMD down

else
    echo "Invalid clean option specified: $CLEAN"
    echo "Please specify 'clean' or 'noclean'."
    exit 1
fi

$COMPOSE_CMD build 
$COMPOSE_CMD up

exit 0
