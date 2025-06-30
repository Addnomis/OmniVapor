# OmniVapor GitHub Pages Deployment Guide

## Overview
This guide explains how to deploy the OmniVapor React application to GitHub Pages.

## Prerequisites
- Node.js 18+ installed
- Git repository with push access
- GitHub Pages enabled for the repository

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)
The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when code is pushed to the main branch.

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Watch the deployment progress

3. **Access your site:**
   - Site URL: https://Addnomis.github.io/OmniVapor
   - May take 5-10 minutes for first deployment

### Method 2: Manual Deployment
Use the provided deployment script for manual deployment:

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Or deploy manually:**
   ```bash
   cd BuildingMap/pfluger-map
   npm install
   npm run build
   npm run deploy
   ```

## GitHub Pages Configuration

### Repository Settings
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "gh-pages" branch
5. Select "/ (root)" folder

### Package.json Configuration
The `package.json` is already configured with:
- `homepage`: Points to your GitHub Pages URL
- `predeploy`: Builds the app before deployment
- `deploy`: Uses gh-pages to deploy the build folder

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version (requires 18+)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript/ESLint errors

**Deployment Fails:**
- Ensure you have push access to the repository
- Check if GitHub Pages is enabled in repository settings
- Verify the homepage URL in package.json is correct

**Site Not Loading:**
- Wait 5-10 minutes after deployment
- Check if .nojekyll file exists in the build
- Verify GitHub Pages is serving from gh-pages branch

**404 Errors:**
- Ensure homepage URL matches your repository structure
- Check that all assets are properly referenced

### Debug Steps
1. Check GitHub Actions logs for deployment errors
2. Verify build folder contents locally
3. Test the build locally: `npm run build && npx serve -s build`
4. Check browser console for JavaScript errors

## File Structure
```
OmniVapor/
├── .github/workflows/deploy.yml    # GitHub Actions workflow
├── deploy.sh                       # Manual deployment script
├── BuildingMap/pfluger-map/
│   ├── public/.nojekyll            # Prevents Jekyll processing
│   ├── package.json                # Contains homepage and deploy scripts
│   └── build/                      # Generated build folder (ignored by git)
```

## Performance Optimization
The build is optimized for production with:
- Code splitting and minification
- Gzip compression
- Three.js bundle optimization
- Image optimization for 360° assets

## Security Notes
- No sensitive data should be included in the build
- All API keys should be environment variables
- The site is served over HTTPS by GitHub Pages

## Support
For deployment issues:
1. Check GitHub Actions logs
2. Review this deployment guide
3. Test build locally first
4. Check GitHub Pages status page 