# MeAi Application Usage Guide

This document provides comprehensive instructions for using the MeAi application repository, specifically designed for users who are not programmers.

## Getting Started

### Accessing the Repository

1. **Clone the Repository** (one-time setup)
   ```
   git clone https://github.com/YOUR-USERNAME/meai-project.git
   cd meai-project
   ```

2. **Update to Latest Version** (whenever you need the latest changes)
   ```
   git pull origin main
   ```

### Repository Structure Overview

The repository is organized into these main sections:

- **frontend/** - Contains all user interface files
- **backend/** - Contains server-side code and MCP integration
- **documentation/** - Contains all project documentation
- **tests/** - Contains testing code

## Working with Documentation

All documentation is stored in Markdown (.md) files which can be viewed directly on GitHub or with any text editor.

### Key Documentation Files

- **README.md** - Start here for project overview
- **documentation/repository_setup.md** - Instructions for repository setup
- **documentation/branch_protection.md** - Information about work protection
- **documentation/deployment/** - Deployment guides and verification reports
- **documentation/architecture/** - System architecture documentation

## Making Changes (For Non-Programmers)

### Editing Documentation

The safest way to make changes as a non-programmer is to edit documentation files:

1. **Using GitHub Web Interface**:
   - Navigate to the file you want to edit on GitHub
   - Click the pencil icon (Edit this file)
   - Make your changes
   - Scroll down and add a description of your changes
   - Click "Commit changes"

2. **Using a Text Editor**:
   - Open the file in any text editor
   - Make your changes
   - Save the file
   - Use the following commands to save your changes to the repository:
     ```
     git add path/to/changed/file.md
     git commit -m "Brief description of your changes"
     git push origin main
     ```

### Adding Images or Files

1. **Using GitHub Web Interface**:
   - Navigate to the folder where you want to add files
   - Click "Add file" → "Upload files"
   - Drag and drop files or use the file selector
   - Add a description of the files
   - Click "Commit changes"

2. **Using Command Line**:
   - Copy files to the appropriate directory
   - Use the following commands:
     ```
     git add path/to/new/file
     git commit -m "Added new file: description"
     git push origin main
     ```

## Backup and Safety Measures

### Running Backups Manually

The repository includes an automatic backup script that you can run manually:

```
./backup.sh
```

This creates a timestamped backup in the `/home/ubuntu/meai_backups` directory.

### Recovering Previous Versions

If you need to recover a previous version of a file:

1. **Using GitHub Web Interface**:
   - Navigate to the file on GitHub
   - Click "History" (button near the top right of the file view)
   - Find the version you want to restore
   - Click the "..." button and select "View file"
   - Click "Edit" (pencil icon)
   - Commit the changes to restore this version

2. **Using Git Command Line**:
   - View file history:
     ```
     git log --follow path/to/file
     ```
   - Restore a specific version:
     ```
     git checkout COMMIT_HASH path/to/file
     git commit -m "Restored file to previous version"
     ```

## Deployment

### Viewing Current Deployment

The application is currently deployed at:
- Frontend: https://vqfafkkc.manus.space
- Backend API: https://8001-iz9vg4qpeskut660kugpd-adaa25d4.manus.computer

### Deploying Updates

For detailed deployment instructions, refer to:
- **documentation/deployment/meai_deployment_documentation.md**

## Common Tasks for Non-Programmers

### Updating Documentation

1. Edit the relevant Markdown (.md) files
2. Commit and push your changes as described above

### Adding New Documentation

1. Create a new .md file in the appropriate documentation directory
2. Add your content using Markdown formatting
3. Commit and push your changes

### Reporting Issues

If you encounter problems with the application:

1. Create a detailed description of the issue
2. Include steps to reproduce the problem
3. Add screenshots if applicable
4. Create a new issue on GitHub or contact the development team

## Getting Help

If you need assistance with the repository:

1. Refer to the documentation in the repository
2. Check GitHub's documentation: https://docs.github.com/
3. Contact the repository administrator

## Best Practices for Non-Programmers

1. **Always pull before making changes**:
   ```
   git pull origin main
   ```

2. **Make small, focused changes** rather than changing many things at once

3. **Add clear commit messages** that explain what you changed and why

4. **Run backups regularly** using the provided backup script

5. **Don't modify code files** unless you understand the programming language

6. **Use branches** for significant changes:
   ```
   git checkout -b descriptive-branch-name
   # Make your changes
   git add .
   git commit -m "Description of changes"
   git push origin descriptive-branch-name
   ```
   Then create a pull request on GitHub for review.

By following these guidelines, you can effectively use and contribute to the MeAi project repository without needing programming expertise.
