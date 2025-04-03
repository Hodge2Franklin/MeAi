# Thread Persistence Instructions

## Overview

This document provides instructions for maintaining continuity between conversation threads when working with the MeAI project. Following these guidelines will ensure that your work is never lost when starting new conversations.

## Why Thread Persistence Matters

AI conversation threads have limitations on length and context. When a thread becomes too long or when you start a new conversation, there's a risk of losing context about your project's current state. These instructions will help you maintain continuity across multiple conversations.

## Setup Instructions

### 1. Reference the Repository Structure

Always refer to this repository when starting a new conversation. The repository is organized as follows:

```
MeAi/
├── src/               # Source code
│   ├── audio/         # Audio system components
│   ├── visual/        # Visual system components
│   ├── conversation/  # Conversation system components
│   ├── index.html     # Main application
│   └── ...            # Other source files
├── docs/              # Documentation
├── guides/            # User guides
└── backups/           # Backup files
```

### 2. Starting a New Conversation

When starting a new conversation with an AI assistant, begin with:

```
This task inherits files and context from an original task.
---
Below are files created or edited in the original task:
* [List key files from the repository]
---
Below are the conversations between the user and you (agent) from the original task:
* user: [Brief summary of previous request]
* agent: [Brief summary of previous response]
* [Include other key exchanges]
---
Now continue the task based on the inherited context and files.
```

### 3. Key Files to Reference

Always include these files in your context references:

- `/src/index.html` - The main application
- `/docs/technical_documentation.md` - Technical documentation
- `/guides/user_guide.md` - User guide for non-programmers
- Any specific files you were working on in the previous conversation

### 4. Maintaining Project State

After each significant development:

1. Commit changes to the repository
2. Update documentation to reflect current state
3. Create a brief summary of what was accomplished

## Best Practices

### Documentation Updates

Always keep documentation updated with the latest changes:

1. Update technical documentation when changing code
2. Update user guides when changing functionality
3. Add comments to code explaining complex sections

### Regular Backups

Create backups of your work:

1. Use the `/backups` directory for important milestones
2. Date your backups (e.g., `meai-backup-2025-04-03.zip`)
3. Include a brief description of what the backup contains

### Version Control

Use proper version control practices:

1. Make meaningful commit messages
2. Create branches for experimental features
3. Tag important releases

## Troubleshooting

If you lose context between conversations:

1. Refer to the latest documentation in the repository
2. Check the commit history for recent changes
3. Review the backups directory for recent backups

## Example Context Handover

Here's an example of how to start a new conversation:

```
This task inherits files and context from an original task.
---
Below are files created or edited in the original task:
* /src/index.html
* /src/audio/dynamic-ambient-system.js
* /src/visual/pixel-animation-system.js
* /docs/technical_documentation.md
---
Below are the conversations between the user and you (agent) from the original task:
* user: Implement dynamic ambient sound system
* agent: I've implemented the dynamic ambient sound system with multiple soundscapes
* user: Add visual enhancements
* agent: I've added pixel animation and dynamic background systems
---
Now continue the task based on the inherited context and files.
```

By following these instructions, you'll ensure continuity between conversations and never lose your work on the MeAI project.
