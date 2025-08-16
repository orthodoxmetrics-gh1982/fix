#!/bin/bash
# Server & Frontend Migration Script
# Migrates 2579 files to new structure

set -e  # Exit on error

echo "Starting Server & Frontend Migration..."
echo "Total files to migrate: 2579"

# Create base directories
echo "Creating directory structure..."
mkdir -p orthodoxmetrics_clean

# Create server directories
mkdir -p orthodoxmetrics_clean/server/controllers
mkdir -p orthodoxmetrics_clean/server/routes
mkdir -p orthodoxmetrics_clean/server/middleware
mkdir -p orthodoxmetrics_clean/server/models
mkdir -p orthodoxmetrics_clean/server/services
mkdir -p orthodoxmetrics_clean/server/utils
mkdir -p orthodoxmetrics_clean/server/websockets
mkdir -p orthodoxmetrics_clean/server/jobs
mkdir -p orthodoxmetrics_clean/server/scrapers

# Create frontend directories
mkdir -p orthodoxmetrics_clean/frontend/src/components
mkdir -p orthodoxmetrics_clean/frontend/src/pages
mkdir -p orthodoxmetrics_clean/frontend/src/views
mkdir -p orthodoxmetrics_clean/frontend/src/api
mkdir -p orthodoxmetrics_clean/frontend/src/contexts
mkdir -p orthodoxmetrics_clean/frontend/src/hooks
mkdir -p orthodoxmetrics_clean/frontend/src/utils
mkdir -p orthodoxmetrics_clean/frontend/src/styles
mkdir -p orthodoxmetrics_clean/frontend/src/assets
mkdir -p orthodoxmetrics_clean/frontend/src/core
mkdir -p orthodoxmetrics_clean/frontend/public

echo "Directory structure created."
echo ""
echo "Ready to migrate files. Run 'node migrate_files.js' to proceed."
