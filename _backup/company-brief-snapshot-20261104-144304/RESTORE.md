# Company Brief restore snapshot

Created: 2026-11-04 14:43:10
Snapshot: C:\Users\Saloni Ushant Mapari\Desktop\Boiler House\_backup\company-brief-snapshot-20261104-144304

## Baseline captured
- CompanyBrief.current.jsx is the exact current Company Brief page code.
- CompanyBrief.before-last-image-change.jsx is the same code with only the
  Trade and Market Profile image restored to /company/boiler-house-vendor-base.png.
- company-assets/ is a copy of frontend/public/company/.
- project-snapshot-20261104-144304.zip contains all project files except node_modules, dist and .git.

## Revert a future Company Brief redesign
1. Copy CompanyBrief.current.jsx back to:
   frontend/src/pages/CompanyBrief.jsx
2. Restore any Company Brief images from company-assets/ if they were changed.
3. If other files were changed during the redesign, extract the full
   project-snapshot-20261104-144304.zip over the project root.

## Revert only the last image-only change
1. Copy CompanyBrief.before-last-image-change.jsx to:
   frontend/src/pages/CompanyBrief.jsx
2. Optionally delete frontend/public/company/boiler-house-trade-export.jpg
   (it did not exist before that image change).

The live files were not modified while creating this snapshot.
