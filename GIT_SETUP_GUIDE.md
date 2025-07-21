# Git Configuration Setup Guide

## Current Status
Your Git is missing user name and email configuration. This needs to be set before making commits.

## Fix: Configure Your Git Identity

Run these commands in your terminal (replace with your actual name and email):

```bash
# Set your name (use your real name or GitHub username)
git config --global user.name "Your Full Name"

# Set your email (IMPORTANT: use the same email as your GitHub account)
git config --global user.email "your.email@example.com"
```

## Example:
```bash
git config --global user.name "Ajit Goel"
git config --global user.email "ajit@example.com"
```

## Verify Configuration:
After setting, verify with:
```bash
git config --global user.name
git config --global user.email
```

## Why This Matters:
- **GitHub integration**: Your email must match your GitHub account email
- **Commit authorship**: Shows who made each change
- **Professional workflow**: Required for all Git operations

## Alternative: Repository-Only Configuration
If you want different settings just for this project:
```bash
# Remove --global to set only for this repository
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Next Steps After Configuration:
1. Run the configuration commands above
2. Verify with the verification commands
3. Then continue with Git initialization:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Numerology Calculator v2.1.0"
   ```

## Important Notes:
- **Use the same email as your GitHub account** for seamless integration
- **--global** sets this for all Git repositories on your computer
- **Without --global** sets it only for the current project