# MeAi Project Persistence Strategy

This document outlines the comprehensive persistence strategy implemented for the MeAi project to ensure that work is never lost and that all project assets are properly preserved.

## Multi-layered Backup Approach

The MeAi project implements a multi-layered approach to persistence:

### 1. Git Version Control

The primary persistence mechanism is Git version control:

- **Complete History**: Git maintains a complete history of all changes
- **Distributed Copies**: Every clone of the repository contains the full history
- **Commit Frequency**: Frequent commits create regular save points
- **Descriptive Messages**: Clear commit messages document the purpose of each change

### 2. Automated Backup Script

The project includes an automated backup script (`backup.sh`) that:

- Creates timestamped compressed archives of the entire repository
- Maintains the 5 most recent backups to conserve space
- Can be run manually or scheduled via cron
- Verifies successful backup creation

To schedule daily automatic backups:
```bash
# Open crontab editor
crontab -e

# Add a line to run the backup script daily at midnight
0 0 * * * /path/to/meai_project/backup.sh

# Save and exit
```

### 3. Branch Protection

The repository implements branch protection rules to prevent accidental loss:

- **Protected Main Branch**: Prevents direct pushes and deletion
- **Required Reviews**: Changes require review before merging
- **Status Checks**: Automated tests must pass before merging
- **Development Branches**: Work is done in feature branches to isolate changes

See `documentation/branch_protection.md` for detailed branch protection configuration.

### 4. Remote Repository Hosting

The GitHub-hosted repository provides:

- **Cloud Storage**: Resilient storage independent of local machines
- **Access Control**: Permissions management for contributors
- **Redundancy**: GitHub's infrastructure includes multiple redundancies
- **Issue Tracking**: Documentation of bugs and feature requests

### 5. Documentation Redundancy

Critical information is documented in multiple locations:

- **README.md**: Contains project overview and structure
- **Specialized Documentation**: Detailed guides for specific aspects
- **Code Comments**: Documentation embedded within code
- **External Documentation**: Additional copies stored outside the repository

## Recovery Procedures

### Local Work Recovery

If local changes are lost or corrupted:

1. **Git Recovery**:
   ```bash
   # View recent commits
   git log --oneline
   
   # Restore repository to a specific commit
   git reset --hard COMMIT_HASH
   
   # Restore specific files from a commit
   git checkout COMMIT_HASH -- path/to/file
   ```

2. **Backup Archive Recovery**:
   ```bash
   # List available backups
   ls -la /home/ubuntu/meai_backups
   
   # Extract a specific backup
   tar -xzf /home/ubuntu/meai_backups/meai_backup_YYYY-MM-DD_HH-MM-SS.tar.gz -C /path/to/recovery/location
   ```

### Remote Repository Recovery

If the remote repository is compromised:

1. **Push from Local Copy**:
   ```bash
   # Create a new repository on GitHub
   # Then push your local copy
   git push -u new-origin main
   ```

2. **Restore from Backup**:
   ```bash
   # Extract backup
   tar -xzf /home/ubuntu/meai_backups/meai_backup_YYYY-MM-DD_HH-MM-SS.tar.gz -C /path/to/recovery/location
   
   # Initialize Git and push to new repository
   cd /path/to/recovery/location/meai_project
   git remote add origin https://github.com/YOUR-USERNAME/new-repo-name.git
   git push -u origin main
   ```

## Thread Limit Persistence

To handle GitHub's thread limit for large repositories:

1. **Repository Segmentation**:
   - Split the repository into logical components if it grows too large
   - Use Git submodules to maintain connections between components

2. **Large File Handling**:
   - Use Git LFS (Large File Storage) for binary files over 5MB
   - Store very large datasets externally with references in the repository

3. **Commit Optimization**:
   - Group related changes into single commits
   - Avoid committing temporary or generated files

## Disaster Recovery Plan

In case of catastrophic failure:

1. **Identify Available Recovery Sources**:
   - Local Git repositories
   - GitHub repository
   - Backup archives
   - Team members' repositories

2. **Select Most Recent Complete Source**:
   - Verify integrity of the recovery source
   - Check for any missing recent changes

3. **Restore Repository**:
   - Follow appropriate recovery procedure from above
   - Verify all critical files are present
   - Test functionality after recovery

4. **Document Incident**:
   - Record what happened and recovery steps taken
   - Implement additional safeguards if needed

## Persistence Verification

Regular checks to ensure persistence mechanisms are working:

1. **Weekly Verification**:
   - Check that backups are being created
   - Verify backup integrity with test restoration
   - Ensure Git history is intact

2. **Monthly Drill**:
   - Practice recovery from backup
   - Test branch protection rules
   - Verify documentation is current

## Conclusion

This multi-layered persistence strategy ensures that the MeAi project's work is protected against various failure scenarios. By combining Git version control, automated backups, branch protection, remote hosting, and documentation redundancy, we create a robust system that prevents data loss and enables quick recovery when needed.

Remember: The best persistence strategy is one that becomes a natural part of the development workflow. Commit often, run backups regularly, and follow the documented procedures to ensure your work is always protected.
