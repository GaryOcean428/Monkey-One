#!/bin/bash

# Function to calculate relative path
calculate_relative_path() {
  local source_dir=$(dirname "$1")
  local target_path="$2"
  local relative_path=""
  
  # Remove common prefix
  local common_prefix="src/"
  source_dir=${source_dir#$common_prefix}
  target_path=${target_path#$common_prefix}
  
  # Calculate the number of "../" needed
  local IFS="/"
  local source_parts=($source_dir)
  local depth=${#source_parts[@]}
  
  for ((i=0; i<depth; i++)); do
    relative_path="../$relative_path"
  done
  
  echo "${relative_path}${target_path}"
}

# Process all TypeScript/TypeScript React files
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  echo "Processing $file"
  
  # Get all @/ imports (both 'from "@/..."' and 'import "@/..."')
  grep -o '"@/[^"]*"' "$file" | while read -r import; do
    # Extract the import path
    path=${import#\"}
    path=${path%\"}
    path=${path#@/}
    
    # Calculate relative path
    relative_path=$(calculate_relative_path "$file" "$path")
    
    # Replace the import
    escaped_path=$(echo "$path" | sed 's/\//\\\//g')
    sed -i "s/@\/$escaped_path/$relative_path/g" "$file"
  done
done
