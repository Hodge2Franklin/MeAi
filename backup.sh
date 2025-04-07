#!/bin/bash

# Automated backup script for MeAi project
# This script creates a timestamped backup of the entire repository

# Configuration
BACKUP_DIR="/home/ubuntu/meai_backups"
REPO_DIR="/home/ubuntu/meai_project"
DATE_FORMAT=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="meai_backup_${DATE_FORMAT}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create the backup
echo "Creating backup of MeAi project..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" -C "$(dirname "$REPO_DIR")" "$(basename "$REPO_DIR")"

# Verify backup was created successfully
if [ $? -eq 0 ]; then
  echo "Backup created successfully: ${BACKUP_DIR}/${BACKUP_NAME}"
  echo "Backup size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)"
else
  echo "Error: Backup creation failed!"
  exit 1
fi

# Keep only the 5 most recent backups to save space
echo "Cleaning up old backups..."
ls -t "${BACKUP_DIR}"/*.tar.gz | tail -n +6 | xargs -r rm
echo "Backup cleanup complete. Kept the 5 most recent backups."

# List current backups
echo "Current backups:"
ls -lh "${BACKUP_DIR}" | grep .tar.gz

echo "Backup process completed successfully."
