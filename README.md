
# Boston Butt Fundraiser Tracker

A simple React + Vite web app to track ticket assignments and sales for your annual Boston Butt fundraiser.

## Features
- Track **Assigned**, **Sold**, **On Hand** tickets separately for **Monday** and **Tuesday** pickup.
- Record **Sell + Collect** (adds to collected dollars automatically).
- Record separate **Donations** that are not tied to tickets.
- Enforces **no overselling**: you cannot sell+collect more than tickets on hand for the selected day.
- **LocalStorage** persistence.
- **Printable** report (buttons/inputs hidden on print).

## Local Dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

The static site will be in the `dist` folder.

## Deploy to Netlify
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- No environment variables required.

## Deploy to GitHub Pages (optional)
This project is optimized for Netlify, but can be adapted for GH Pages using `vite` base config if needed.
