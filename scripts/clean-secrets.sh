#!/bin/bash

# Create a backup of the current directory
echo "Creating backup..."
cd ..
cp -r Monkey-One Monkey-One-backup

# Clone a fresh copy
echo "Cloning fresh copy..."
git clone https://github.com/GaryOcean428/Monkey-One.git Monkey-One-clean
cd Monkey-One-clean

# Remove sensitive files from history
echo "Removing sensitive files from history..."
git-filter-repo --invert-paths --path .env.vercel --path .env.new --force

# Force push the changes
echo "Force pushing changes..."
git remote add origin https://github.com/GaryOcean428/Monkey-One.git
git push origin --force --all

echo "Done! The repository has been cleaned of sensitive files."
echo "Please cd into ../Monkey-One-clean and continue working from there."
echo "A backup of your old repository is in ../Monkey-One-backup"
