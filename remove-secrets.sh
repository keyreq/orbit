#!/bin/bash
# Script to remove secrets from git history
# This will rewrite git history - all contributors must re-clone after running

echo "⚠️  WARNING: This will rewrite git history!"
echo "All collaborators will need to re-clone the repository."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Remove the file containing secrets from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PRODUCTION_CHECKLIST.md" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Secrets removed from git history"
echo "⚠️  Next steps:"
echo "1. Rotate your MongoDB and Gemini API credentials"
echo "2. Force push to GitHub: git push origin --force --all"
echo "3. All collaborators must delete and re-clone the repo"
