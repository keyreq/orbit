# Creating App Icons for ORBIT

## Quick Method - Using Online Tools

### Option 1: RealFaviconGenerator (Recommended)
1. Go to https://realfavicongenerator.net/
2. Upload a square PNG image (at least 512x512px)
3. Adjust iOS settings:
   - Choose "Add a solid, plain background color"
   - Select a dark blue color: `#0a0e1a`
4. Click "Generate favicons"
5. Download the package
6. Extract and copy files to `public` folder:
   - `android-chrome-192x192.png` → `icon-192.png`
   - `android-chrome-512x512.png` → `icon-512.png`
   - `apple-touch-icon.png` (keep as is)
   - `favicon.ico` (keep as is)

### Option 2: PWA Asset Generator
```bash
# Install globally
npm install -g pwa-asset-generator

# Generate all icons from a single image
pwa-asset-generator source-icon.png public --background "#0a0e1a" --type png
```

## Design Guidelines

### Icon Design Tips
- **Simple & Clear**: Use a simple symbol that's recognizable at small sizes
- **High Contrast**: Use light icon on dark background or vice versa
- **No Text**: Avoid small text in icons (unreadable at small sizes)
- **Center Focus**: Keep main elements centered with padding

### Suggested ORBIT Icon Concepts
1. **Orbit Symbol**: Circular orbital paths with a dot/planet
2. **Crypto Symbol**: Stylized Bitcoin/crypto symbol
3. **Dashboard**: Grid or chart symbol
4. **Bell/Alert**: Notification bell with crypto symbol

### Color Palette
- Primary: `#3b82f6` (Blue - used in app)
- Background: `#0a0e1a` (Dark blue-black)
- Accent: `#60a5fa` (Light blue)

## Required Sizes

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192x192px | Android/PWA small |
| `icon-512.png` | 512x512px | Android/PWA large |
| `apple-touch-icon.png` | 180x180px | iOS home screen |
| `favicon.ico` | 32x32px | Browser tab |
| `splash-screen.png` | 1170x2532px | iOS launch screen |

## DIY with Figma (Free)

1. **Create a Figma Account**: https://figma.com
2. **Create New File**: 512x512px frame
3. **Design Your Icon**:
   ```
   Background: #0a0e1a (dark)
   Icon: #3b82f6 (blue)
   Padding: 64px on all sides
   ```
4. **Export**:
   - Select frame
   - Right sidebar → Export
   - Set different sizes: 192, 512, 180, 32
   - Export as PNG

## Quick Placeholder (Temporary)

For testing, you can use a simple colored square:

1. Go to https://placehold.co/
2. Generate placeholders:
   - https://placehold.co/192x192/0a0e1a/3b82f6?text=ORBIT
   - https://placehold.co/512x512/0a0e1a/3b82f6?text=ORBIT
   - https://placehold.co/180x180/0a0e1a/3b82f6?text=ORBIT
3. Right-click → Save as...
4. Rename and place in `public` folder

⚠️ **Note**: Replace with professional icons before public launch

## Professional Design Services

If you need professional icons:
- **Fiverr**: $20-50 for icon design
- **99designs**: Design contest for multiple options
- **Upwork**: Hire a designer

## Testing Your Icons

After creating icons:
1. Clear browser cache
2. Reload your app
3. Check browser tab (favicon)
4. Add to home screen on iPhone
5. Verify icon appears correctly

## Splash Screen

For iOS splash screen (1170x2532px):
- Use dark background: `#0a0e1a`
- Center your logo/icon
- Add "ORBIT" text below icon
- Keep it simple and clean
