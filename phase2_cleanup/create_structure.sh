#!/bin/bash
# Final Migration Script - Phase 2
# This script creates the new directory structure

echo "Creating OrthodoxMetrics Clean Structure..."

# Create main directories
mkdir -p orthodoxmetrics_clean

# Server directories
mkdir -p orthodoxmetrics_clean/server/{controllers,routes,middleware,models,services,utils,websockets,jobs,scrapers}

# Frontend directories  
mkdir -p orthodoxmetrics_clean/frontend/src/{components,pages,views,api,contexts,hooks,utils,styles,assets,core}
mkdir -p orthodoxmetrics_clean/frontend/public

# OMAI module
mkdir -p orthodoxmetrics_clean/omai/{services,components,database,bigbook,core}

# Database
mkdir -p orthodoxmetrics_clean/database/{schemas,migrations,scripts}

# Operations
mkdir -p orthodoxmetrics_clean/ops/{scripts,monitoring,deployment,audit}

# Configuration
mkdir -p orthodoxmetrics_clean/config/{app,build,deploy}

# Documentation
mkdir -p orthodoxmetrics_clean/docs/{guides,api,development}

# Testing
mkdir -p orthodoxmetrics_clean/tests/{unit,integration,fixtures}

# Scripts
mkdir -p orthodoxmetrics_clean/scripts/{maintenance,setup,build,utility}

# Data
mkdir -p orthodoxmetrics_clean/data/{samples,fixtures,migrations}

# Archive
mkdir -p orthodoxmetrics_clean/archive/{legacy,backups}

echo "Directory structure created successfully!"
echo "Ready for file migration."
