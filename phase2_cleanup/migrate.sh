#!/bin/bash
# Phase 2 Migration Script
# This script will organize files into the new clean structure

echo "Creating clean directory structure..."
mkdir -p orthodoxmetrics_clean/server
mkdir -p orthodoxmetrics_clean/frontend
mkdir -p orthodoxmetrics_clean/database
mkdir -p orthodoxmetrics_clean/docs
mkdir -p orthodoxmetrics_clean/config
mkdir -p orthodoxmetrics_clean/public
mkdir -p orthodoxmetrics_clean/scripts
mkdir -p orthodoxmetrics_clean/misc

echo "Migration plan created. Total files to migrate: 9421"
echo "Review migration_plan.json before proceeding."
