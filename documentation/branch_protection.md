# Branch Protection Configuration

This document outlines the branch protection rules implemented for the MeAi project repository to prevent accidental loss of work.

## Main Branch Protection

The `main` branch has the following protection rules:

1. **Require pull request reviews before merging**
   - At least 1 review required before changes can be merged
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners

2. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Status checks required:
     - Unit tests
     - Integration tests
     - Linting

3. **Restrict who can push to matching branches**
   - Only administrators can push directly to the main branch
   - All other contributors must use pull requests

4. **Do not allow bypassing the above settings**
   - These rules apply to everyone including administrators

5. **Prevent deletion of the branch**
   - The main branch cannot be deleted

## Development Branch Guidelines

For development work:

1. Create feature branches from main using the naming convention:
   - `feature/descriptive-feature-name`
   - `bugfix/issue-description`
   - `hotfix/critical-issue-description`

2. After completing work, create a pull request to merge changes back to main

3. Pull requests require:
   - Descriptive title and description
   - Passing tests
   - Code review approval

## Local Repository Protection

To protect your local repository:

1. Run the backup script regularly:
   ```
   ./backup.sh
   ```

2. Commit changes frequently with descriptive messages:
   ```
   git add .
   git commit -m "Descriptive message about changes"
   ```

3. Push changes to remote repository regularly:
   ```
   git push origin your-branch-name
   ```

4. Before making significant changes, create a backup branch:
   ```
   git checkout -b backup/your-feature-name-date
   git push origin backup/your-feature-name-date
   ```

These protection measures ensure that work is not accidentally lost and that the main branch always contains stable, reviewed code.
