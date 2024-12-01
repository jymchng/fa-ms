#!/bin/bash

# Check if an argument was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [development|production]"
    exit 1
fi

# Get the environment from the first argument
ENV=$1

# Function to copy files for development
copy_files_development() {
    echo "Copying files for development..."
    npx copyfiles -a src/**/*.js src/**/*.d.mts src/**/*.d.ts src/**/*.js.map src/**/*.mjs src/**/*.mjs.map secrets/.*.$ENV .env.$ENV package*.json prisma/* build-dev
}

# Function to copy files for production
copy_files_production() {
    echo "Copying files for production..."
    npx copyfiles -a src/**/*.js src/**/*.d.mts src/**/*.d.ts src/**/*.js.map src/**/*.mjs src/**/*.mjs.map secrets/.*.$ENV .env.$ENV package*.json prisma/* build
}

# Decision making based on the environment
case "$ENV" in
    "development")
        copy_files_development
        ;;
    "production")
        copy_files_production
        ;;
    *)
        echo "Invalid environment specified: $ENV"
        echo "Please specify 'development' or 'production'."
        exit 1
        ;;
esac
 
exit 0