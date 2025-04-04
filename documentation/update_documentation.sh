#!/bin/bash

# MeAI Project Documentation Update Script
# This script automatically updates the project state documentation
# with the latest information from the repository.

# Set variables
REPO_DIR="/home/ubuntu/MeAi-Repo"
DOC_DIR="$REPO_DIR/documentation"
PROJECT_STATE_FILE="$DOC_DIR/project_state.md"
CURRENT_DATE=$(date +"%B %d, %Y")
CURRENT_VERSION=$(grep -m 1 "## Version" "$REPO_DIR/docs/release-notes.md" | sed 's/## Version \(.*\) (.*/\1/')
DEPLOYMENT_URL=$(grep -m 1 "Deployed to permanent URL:" "$REPO_DIR/docs/release-notes.md" | sed 's/.*URL: \(.*\)/\1/')
LAST_COMMIT=$(cd "$REPO_DIR" && git log -1 --pretty="%s")

echo "Updating MeAI Project State Documentation..."
echo "Current Version: $CURRENT_VERSION"
echo "Last Commit: $LAST_COMMIT"

# Create backup of current documentation
if [ -f "$PROJECT_STATE_FILE" ]; then
    cp "$PROJECT_STATE_FILE" "$DOC_DIR/project_state_backup_$(date +%Y%m%d_%H%M%S).md"
    echo "Backup created."
fi

# Update the project state file header
sed -i "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" "$PROJECT_STATE_FILE"
sed -i "s/\*\*Version:\*\* .*/\*\*Version:\*\* $CURRENT_VERSION/" "$PROJECT_STATE_FILE"
sed -i "s|\*\*Deployment URL:\*\* .*|\*\*Deployment URL:\*\* $DEPLOYMENT_URL|" "$PROJECT_STATE_FILE"

# Update repository information
sed -i "s/\*\*Last Commit:\*\* .*/\*\*Last Commit:\*\* $LAST_COMMIT/" "$PROJECT_STATE_FILE"

# Update project structure (generate dynamically)
echo "Updating project structure..."
STRUCTURE_START=$(grep -n "### Project Structure" "$PROJECT_STATE_FILE" | cut -d: -f1)
STRUCTURE_END=$(grep -n "### Development Status" "$PROJECT_STATE_FILE" | cut -d: -f1)

# Generate new structure content
STRUCTURE_CONTENT="\n\`\`\`\n"
STRUCTURE_CONTENT+=$(cd "$REPO_DIR" && find . -type d -not -path "*/\.*" -not -path "*/node_modules/*" | sort | sed 's/\.\///' | sed 's/^//' | sed 's/$/\//')
STRUCTURE_CONTENT+="\n\`\`\`\n"

# Replace structure content in the file
TEMP_FILE=$(mktemp)
head -n $STRUCTURE_START "$PROJECT_STATE_FILE" > "$TEMP_FILE"
echo -e "### Project Structure" >> "$TEMP_FILE"
echo -e "$STRUCTURE_CONTENT" >> "$TEMP_FILE"
tail -n +$STRUCTURE_END "$PROJECT_STATE_FILE" >> "$TEMP_FILE"
mv "$TEMP_FILE" "$PROJECT_STATE_FILE"

# Update development status
echo "Updating development status..."
TODO_ITEMS=$(grep -E "^- \[ \]" "$REPO_DIR/todo.md" | sed 's/- \[ \] //')
DONE_ITEMS=$(grep -E "^- \[x\]" "$REPO_DIR/todo.md" | sed 's/- \[x\] //')

# Update next development priorities
NEXT_PRIORITIES_START=$(grep -n "#### Next Development Priorities" "$PROJECT_STATE_FILE" | cut -d: -f1)
NEXT_PRIORITIES_END=$(grep -n "## Technical Architecture" "$PROJECT_STATE_FILE" | cut -d: -f1)

# Generate new priorities content
PRIORITIES_CONTENT="\n"
PRIORITY_NUM=1
while IFS= read -r line; do
    PRIORITIES_CONTENT+="$PRIORITY_NUM. $line\n"
    PRIORITY_NUM=$((PRIORITY_NUM + 1))
done <<< "$TODO_ITEMS"

# Replace priorities content in the file
TEMP_FILE=$(mktemp)
head -n $NEXT_PRIORITIES_START "$PROJECT_STATE_FILE" > "$TEMP_FILE"
echo -e "#### Next Development Priorities" >> "$TEMP_FILE"
echo -e "$PRIORITIES_CONTENT" >> "$TEMP_FILE"
tail -n +$NEXT_PRIORITIES_END "$PROJECT_STATE_FILE" >> "$TEMP_FILE"
mv "$TEMP_FILE" "$PROJECT_STATE_FILE"

# Generate component list
echo "Updating component list..."
COMPONENTS=$(cd "$REPO_DIR/src" && find . -name "*.js" | sort)

# Update deployment information
echo "Updating deployment information..."
sed -i "s/\*\*Last Deployed:\*\* .*/\*\*Last Deployed:\*\* $CURRENT_DATE/" "$PROJECT_STATE_FILE"

# Create component documentation index
COMPONENT_INDEX_FILE="$DOC_DIR/component_index.md"
echo "# MeAI Component Index" > "$COMPONENT_INDEX_FILE"
echo "" >> "$COMPONENT_INDEX_FILE"
echo "**Generated on:** $CURRENT_DATE" >> "$COMPONENT_INDEX_FILE"
echo "" >> "$COMPONENT_INDEX_FILE"
echo "## Components by Category" >> "$COMPONENT_INDEX_FILE"
echo "" >> "$COMPONENT_INDEX_FILE"

# Process components by category
for category in audio conversation utils visual; do
    echo "### $category" >> "$COMPONENT_INDEX_FILE"
    echo "" >> "$COMPONENT_INDEX_FILE"
    cd "$REPO_DIR/src" && find "./$category" -name "*.js" | sort | while read -r file; do
        component_name=$(basename "$file" .js)
        component_path="src/$category/$(basename "$file")"
        echo "- **$component_name**: \`$component_path\`" >> "$COMPONENT_INDEX_FILE"
        
        # Extract first comment block as description if available
        description=$(grep -A 1 "^\s*\/\*\*" "$REPO_DIR/$component_path" | grep -v "^\s*\/\*\*" | grep -v "^\s*\*\/" | sed 's/^\s*\* //' | head -1)
        if [ ! -z "$description" ]; then
            echo "  - $description" >> "$COMPONENT_INDEX_FILE"
        fi
    done
    echo "" >> "$COMPONENT_INDEX_FILE"
done

# Create file count statistics
echo "## Project Statistics" >> "$COMPONENT_INDEX_FILE"
echo "" >> "$COMPONENT_INDEX_FILE"
echo "- **Total Files:** $(find "$REPO_DIR" -type f -not -path "*/\.*" -not -path "*/node_modules/*" | wc -l)" >> "$COMPONENT_INDEX_FILE"
echo "- **JavaScript Files:** $(find "$REPO_DIR" -name "*.js" -not -path "*/node_modules/*" | wc -l)" >> "$COMPONENT_INDEX_FILE"
echo "- **HTML Files:** $(find "$REPO_DIR" -name "*.html" | wc -l)" >> "$COMPONENT_INDEX_FILE"
echo "- **CSS Files:** $(find "$REPO_DIR" -name "*.css" | wc -l)" >> "$COMPONENT_INDEX_FILE"
echo "- **Markdown Files:** $(find "$REPO_DIR" -name "*.md" | wc -l)" >> "$COMPONENT_INDEX_FILE"
echo "- **Total Lines of Code:** $(find "$REPO_DIR" -type f -name "*.js" -o -name "*.html" -o -name "*.css" -not -path "*/node_modules/*" | xargs cat | wc -l)" >> "$COMPONENT_INDEX_FILE"

# Create dependency graph
echo "## Dependency Graph" >> "$COMPONENT_INDEX_FILE"
echo "" >> "$COMPONENT_INDEX_FILE"
echo "```" >> "$COMPONENT_INDEX_FILE"
echo "MeAI Dependency Structure" >> "$COMPONENT_INDEX_FILE"
echo "├── index.html" >> "$COMPONENT_INDEX_FILE"
echo "│   ├── visual components" >> "$COMPONENT_INDEX_FILE"
echo "│   │   ├── pixel-visualization-3d.js" >> "$COMPONENT_INDEX_FILE"
echo "│   │   ├── advanced-animation-system.js" >> "$COMPONENT_INDEX_FILE"
echo "│   │   └── visualization-integration.js" >> "$COMPONENT_INDEX_FILE"
echo "│   ├── audio components" >> "$COMPONENT_INDEX_FILE"
echo "│   │   └── spatial-audio-system.js" >> "$COMPONENT_INDEX_FILE"
echo "│   ├── conversation components" >> "$COMPONENT_INDEX_FILE"
echo "│   │   └── long-term-memory-system.js" >> "$COMPONENT_INDEX_FILE"
echo "│   └── utility components" >> "$COMPONENT_INDEX_FILE"
echo "│       └── advanced-user-profile-system.js" >> "$COMPONENT_INDEX_FILE"
echo "```" >> "$COMPONENT_INDEX_FILE"

# Create documentation index
DOC_INDEX_FILE="$DOC_DIR/documentation_index.md"
echo "# MeAI Documentation Index" > "$DOC_INDEX_FILE"
echo "" >> "$DOC_INDEX_FILE"
echo "**Generated on:** $CURRENT_DATE" >> "$DOC_INDEX_FILE"
echo "" >> "$DOC_INDEX_FILE"
echo "## Available Documentation" >> "$DOC_INDEX_FILE"
echo "" >> "$DOC_INDEX_FILE"

# List all documentation files
find "$REPO_DIR/docs" -name "*.md" | sort | while read -r file; do
    doc_name=$(basename "$file" .md | tr '-' ' ' | sed -e 's/\b\(.\)/\u\1/g')
    doc_path=$(echo "$file" | sed "s|$REPO_DIR/||")
    
    # Extract first heading as title if available
    title=$(grep -m 1 "^# " "$file" | sed 's/^# //')
    if [ -z "$title" ]; then
        title="$doc_name"
    fi
    
    echo "- **[$title]($doc_path)**" >> "$DOC_INDEX_FILE"
    
    # Extract first paragraph as description if available
    description=$(sed -n '/^$/,/^$/{/^$/d; /^#/d; p}' "$file" | head -1)
    if [ ! -z "$description" ]; then
        echo "  - $description" >> "$DOC_INDEX_FILE"
    fi
done

echo "" >> "$DOC_INDEX_FILE"
echo "## Project State Documentation" >> "$DOC_INDEX_FILE"
echo "" >> "$DOC_INDEX_FILE"
echo "- **[Project State](documentation/project_state.md)**" >> "$DOC_INDEX_FILE"
echo "  - Comprehensive documentation of the current project state, structure, and progress" >> "$DOC_INDEX_FILE"
echo "- **[Component Index](documentation/component_index.md)**" >> "$DOC_INDEX_FILE"
echo "  - Index of all components in the project with descriptions" >> "$DOC_INDEX_FILE"

echo "Documentation update completed successfully!"
