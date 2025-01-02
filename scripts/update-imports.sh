#!/bin/bash

# Update @ imports to relative paths
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Get the directory depth relative to src
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  rel_path=$(printf '../%.0s' $(seq 1 $((depth-1))))
  
  # Replace @/ with relative path
  sed -i "s|@/|$rel_path|g" "$file"
done
