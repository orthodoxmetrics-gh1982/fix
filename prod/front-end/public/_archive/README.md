# Public Assets Archive

This directory contains assets that were moved from the main public directory to reduce the size of production builds and improve performance.

## Archived on: $(date +%Y-%m-%d)

### Quarantined Assets (Sweep 3):

#### Large Directories:
- `images/banner/` (23MB) - Banner images that appear to be unused by any frontend components
- `images/profile/` (2.3MB) - Profile images that are duplicates of assets in `src/assets/images/profile/`

#### Unused Assets:
- `images/ChatGPT Image Jul 22, 2025, 11_35_37 AM.png` (1.3MB) - Development/temporary image file
- `images/orthodox_metrics_invoice_*.svg` (4 files, ~12KB each) - Invoice templates not referenced in codebase

### Still Active in public/images/:
- `baptisms.png` - Used by Homepage.tsx
- `funerals.png` - Used by Homepage.tsx  
- `marriages.png` - Used by Homepage.tsx
- `global/` directory - Contains small global assets
- Various small utility files

## Notes:
- All moves preserved git history using `git mv`
- Assets can be restored if needed by moving back to `public/images/`
- No runtime routes or component imports should be affected
- Total space saved: ~26.5MB
