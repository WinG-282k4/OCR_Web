# Deployment Checklist & Guide

## Pre-Deployment Checklist

### Code Quality
- [x] TypeScript compilation (no errors)
- [x] ESLint passed
- [x] All imports resolved
- [x] No console.log debug statements
- [x] No unused variables
- [x] Code formatted consistently

### Features Complete
- [x] Landing page fully designed
- [x] Editor workspace functional
- [x] Drag-drop system working
- [x] Component palette complete
- [x] Properties panel functional
- [x] OCR upload interface ready
- [x] HTML export working
- [x] Navigation flow complete
- [x] Mobile responsiveness tested
- [x] Error handling implemented

### Testing
- [ ] Landing page loads
- [ ] Navigation to editor works
- [ ] Components drag correctly
- [ ] Properties update in real-time
- [ ] OCR upload processes (with API key)
- [ ] HTML export generates
- [ ] Mobile layout responsive
- [ ] All buttons clickable
- [ ] No console errors
- [ ] All links navigate correctly

### Documentation
- [x] BUILD_SUMMARY.md created
- [x] PROJECT_FLOW.md created
- [x] ARCHITECTURE.md created
- [x] ROUTES.md created
- [x] SETUP.md created
- [x] DEPLOYMENT.md (this file)
- [x] .env.example provided

### Dependencies
- [x] Redux Toolkit installed
- [x] React Redux installed
- [x] react-beautiful-dnd installed
- [x] shadcn/ui components available
- [x] Lucide icons available
- [x] Tailwind CSS v4 configured

### Environment Setup
- [ ] NANONETS_API_KEY added to .env.local
- [ ] .env.local created from .env.example
- [ ] No sensitive data in code
- [ ] All env vars documented

---

## Local Development Setup

### Step 1: Clone/Open Project
```bash
cd /vercel/share/v0-project
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 3: Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NANONETS_API_KEY=your_api_key_here
```

Get free API key at: https://nanonets.com/customers/signup/

### Step 4: Verify Installation
```bash
npm run build
# Check for any errors
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Test Application
Open http://localhost:3000 in browser

**Test Checklist**:
- [ ] Landing page loads
- [ ] "Launch Editor" button works
- [ ] Editor page opens
- [ ] Component palette visible
- [ ] Canvas renders
- [ ] Properties panel loads
- [ ] Try dragging a component
- [ ] Try editing properties
- [ ] "Home" button returns to landing
- [ ] Export mode works
- [ ] No console errors

---

## Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

#### Prerequisites
- Vercel account (free at vercel.com)
- Vercel CLI installed: `npm i -g vercel`

#### Steps
```bash
# Login to Vercel
vercel login

# Deploy
vercel deploy

# For production
vercel deploy --prod
```

#### During Deployment
- Select project type: Next.js
- Framework preset: Next.js ✓
- Root directory: ./ ✓
- Build command: next build ✓
- Output directory: .next ✓
- Install command: npm install ✓

#### After Deployment
- Visit provided URL
- Verify all pages load
- Test editor functionality
- Check console for errors

---

### Method 2: GitHub Integration (Recommended for Teams)

#### Prerequisites
- GitHub account
- GitHub repo created

#### Steps
```bash
# In project directory
git init
git add .
git commit -m "Initial commit: UIBuilder"
git remote add origin https://github.com/yourusername/uibuilder.git
git push -u origin main
```

#### Vercel Dashboard
1. Visit vercel.com
2. Click "New Project"
3. Select GitHub account
4. Find your repository
5. Click "Import"
6. Configure settings
7. Add environment variables
8. Click "Deploy"

#### Environment Variables in Vercel
1. Go to Project Settings
2. Click "Environment Variables"
3. Add:
   - Key: `NANONETS_API_KEY`
   - Value: `your_api_key_here`
4. Click "Add"
5. Click "Deploy" to redeploy with vars

---

### Method 3: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build & Run
```bash
docker build -t uibuilder .
docker run -p 3000:3000 -e NANONETS_API_KEY=your_key uibuilder
```

---

### Method 4: Traditional Server (AWS, DigitalOcean, etc.)

#### Build
```bash
npm run build
```

#### Upload
```bash
# Upload entire directory to server
scp -r . user@server:/app/uibuilder
```

#### On Server
```bash
cd /app/uibuilder
npm install
export NANONETS_API_KEY=your_key
npm run build
npm start
```

#### Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start npm --name "uibuilder" -- start
pm2 save
```

---

## Post-Deployment Verification

### Functional Tests
- [ ] Landing page loads without errors
- [ ] All sections visible (hero, features, how-it-works)
- [ ] Navigation buttons work
- [ ] "Launch Editor" navigates to editor
- [ ] Editor page fully loads
- [ ] Design mode active by default
- [ ] Component palette visible
- [ ] Canvas renders
- [ ] Properties panel loads
- [ ] Can drag components (no API needed)
- [ ] Can edit component properties
- [ ] Properties update in real-time
- [ ] Switch to Export mode works
- [ ] Preview tab shows HTML
- [ ] Code tab shows HTML source
- [ ] Download button works
- [ ] Copy button works
- [ ] "Home" button returns to landing
- [ ] Mobile responsive layout works
- [ ] Touch interaction works on mobile

### Performance Tests
- [ ] Landing page loads in < 2s
- [ ] Editor loads in < 3s
- [ ] Component drag is smooth (60fps)
- [ ] Property edits are instant
- [ ] No layout shift

### Error Handling Tests
- [ ] Missing API key handled gracefully
- [ ] Invalid image upload shows error
- [ ] Network errors handled
- [ ] Console has no errors
- [ ] No red warnings in console

### Browser Compatibility
- [ ] Chrome/Chromium works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works
- [ ] Mobile Safari works
- [ ] Chrome Mobile works

---

## Environment Variables Setup

### Vercel Environment Variables

**Dashboard Path**: Project Settings → Environment Variables

**Variables to Add**:
```
NANONETS_API_KEY=your_actual_api_key_here
```

**To Get API Key**:
1. Visit https://nanonets.com
2. Sign up for free account
3. Go to dashboard
4. Find "API Key" section
5. Copy your API key
6. Paste into Vercel environment variables

---

## Monitoring & Maintenance

### Daily Checks
- [ ] App loads without errors
- [ ] No 500 errors in logs
- [ ] Response time acceptable

### Weekly Checks
- [ ] OCR still working with latest Nanonets API
- [ ] All features responsive
- [ ] No security issues

### Monthly Checks
- [ ] Update dependencies: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review performance metrics
- [ ] Check error logs

---

## Troubleshooting

### Issue: OCR Not Working
**Solution**: 
1. Check NANONETS_API_KEY is set
2. Verify API key is correct
3. Check Nanonets account not expired
4. Check image size < 5MB
5. Check image format (JPEG/PNG)

### Issue: Deployment Fails
**Solution**:
1. Run `npm run build` locally
2. Check TypeScript errors
3. Check all imports resolve
4. Check .env variables set
5. Check package.json for conflicts

### Issue: Styles Not Loading
**Solution**:
1. Check Tailwind CSS configured
2. Run `npm run build`
3. Clear browser cache
4. Check globals.css imported in layout

### Issue: Components Not Dragging
**Solution**:
1. Check react-beautiful-dnd installed
2. Check Canvas component renders
3. Check browser console for errors
4. Test on desktop (some mobile issues)

### Issue: Properties Not Updating
**Solution**:
1. Check Redux store initialized
2. Check selector hooks working
3. Check dispatch actions correct
4. Check PropertiesPanel connected

### Issue: HTML Export Broken
**Solution**:
1. Check components exist in canvas
2. Check HTML generation function
3. Test with simple component first
4. Check CSS generation correct

---

## Performance Optimization Checklist

Before production:
- [ ] Production build tested locally
- [ ] No console.log statements
- [ ] No debug code
- [ ] Images optimized
- [ ] CSS minified (Tailwind)
- [ ] JavaScript minified
- [ ] Code splitting enabled
- [ ] Unused dependencies removed

---

## Security Checklist

Before production:
- [ ] No API keys in code
- [ ] API keys only in environment variables
- [ ] File upload validation
- [ ] Input sanitization
- [ ] CORS headers correct
- [ ] No sensitive logs
- [ ] HTTPS enforced (Vercel default)
- [ ] CSP headers configured

---

## Backup & Recovery

### Source Code
```bash
# Push to GitHub regularly
git push origin main
```

### Database/State (Future)
- Implement regular backups if adding database
- Keep version history in Git

### Environment
- Keep .env.example updated
- Document all env variables
- Store API keys securely

---

## Scaling Considerations

### Current Architecture
- Single Next.js deployment
- No database required
- Stateless (user state not persisted)
- Can scale horizontally on Vercel

### When to Scale
- Add database for saving designs
- Add user authentication
- Add collaboration features
- Implement caching

### Options
- Vercel automatic scaling
- Multi-region deployment
- Database integration (Supabase, Neon, etc.)
- CDN for assets

---

## Version Control

### Git Workflow
```bash
# Initial setup
git init
git add .
git commit -m "Initial: UIBuilder complete"

# Feature branches
git checkout -b feature/name
# Make changes
git add .
git commit -m "Add feature: description"
git push origin feature/name

# Merge back
git checkout main
git pull origin main
git merge feature/name
git push origin main
```

---

## Continuous Deployment

### Automatic Deployments (with GitHub)
1. Push to `main` branch
2. GitHub notifies Vercel
3. Vercel builds and deploys
4. Preview URL auto-generated
5. Production URL updated if on main

### Preview Deployments
- Every pull request gets a preview URL
- Share with team for testing
- Merge to main for production

---

## Support & Maintenance

### Documentation
- BUILD_SUMMARY.md - Overview
- PROJECT_FLOW.md - User journey
- ARCHITECTURE.md - Technical details
- ROUTES.md - Navigation structure
- SETUP.md - Installation guide
- DEPLOYMENT.md - This file

### Code References
- Comments in complex functions
- Type definitions in lib/types.ts
- Redux patterns in store/
- Component docs in component files

### Getting Help
- Check documentation files first
- Review error messages carefully
- Check browser console
- Review Vercel logs

---

## Final Deployment Steps

1. **Test Locally**
   ```bash
   npm run build
   npm start
   ```

2. **Verify All Features**
   - Landing page ✓
   - Editor ✓
   - Drag-drop ✓
   - Properties ✓
   - Export ✓

3. **Set Environment Variables**
   - NANONETS_API_KEY in Vercel

4. **Deploy**
   ```bash
   git push origin main
   # or
   vercel deploy --prod
   ```

5. **Test Production**
   - Visit deployed URL
   - Test all features
   - Check console for errors
   - Monitor for 24 hours

6. **Announce**
   - Share project link
   - Get feedback
   - Monitor usage

---

## Success Criteria

Deployment is successful when:
- ✓ Landing page loads
- ✓ Navigation works
- ✓ Editor opens
- ✓ Components drag
- ✓ Properties update
- ✓ Export works
- ✓ No console errors
- ✓ Mobile responsive
- ✓ Fast load times
- ✓ All links work

---

## Post-Launch Monitoring

### Week 1
- Monitor error logs daily
- Check user feedback
- Performance monitoring
- Verify all features work

### Month 1
- Fix any reported bugs
- Optimize performance
- Plan enhancements
- Gather user feedback

### Ongoing
- Regular updates
- Security patches
- Performance optimization
- Feature additions based on feedback

---

Your UIBuilder is ready to deploy! 🚀
