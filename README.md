# 🏋️ Set Counter — Mobile-First Gym Whiteboard App

A mobile-first workout set counter, interval timer, and training companion designed for the gym floor. Built with Vite, React, TypeScript, and Tailwind CSS. Zero backend required — 100% offline-ready PWA with persistent `localStorage`.

---

## ⚡ Features

- **🏠 Dashboard Hub**:
  - Live streak counter (`🔥 X-Day Streak`)
  - Quick summary cards (Total Sessions, Total Sets, This Month)
  - 7-Day inline weekly workout volume bar chart
  - Quick start AMRAP button + 2×2 Mode Selection Grid
  - Recent sessions list with quick delete option

- **⏱️ 4 Distinct Workout Modes**:
  1. **AMRAP**: Fixed time countdown (1–120 min) with drift-proof `Date.now()` tracking.
  2. **EMOM**: Every Minute On the Minute with round countdown and start-of-interval alerts.
  3. **Tabata**: High-intensity interval timer with customizable Work / Rest intervals and rounds.
  4. **For Time**: Count-UP stopwatch racing to hit a specified target set count.

- **🎯 Gym-Floor Ergonomics**:
  - **Massive "Set Done!" button** (min-height > 120px) easy to tap while completely exhausted.
  - **Screen Wake Lock API**: Prevents your phone screen from dimming or sleeping mid-workout.
  - **Haptic Feedback**: Vibrations on every set registered (`navigator.vibrate`).
  - **Web Audio API Sound Engine**:
    - 🔔 Boxing Gym Bell on every completed set.
    - 📯 Stadium Air Horn + victory triad fanfare on workout completion.
    - ⏱️ Countdown tick warning during final 10 seconds.
    - Instant sound on/off toggle.
  - **Undo button** to remove accidental set taps.
  - **Pause / Resume** with split-second precision.
  - **Confirmation modal** on finish to prevent accidental session drops.

- **📊 Progress & Analytics**:
  - 7-day volume bar chart.
  - Monthly activity calendar heatmap with workout intensity shading.
  - Personal Records (PRs) tracking best sets per workout & mode.
  - Average time per set & fastest split highlights.

- **📱 Installable Offline PWA**:
  - Web App Manifest + Service Worker with offline asset caching.
  - "Add to Home Screen" support on iOS Safari and Android Chrome.

---

## 🚀 How to Run Locally

### Requirements
- Node.js (v18+ recommended)
- npm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the local dev server (accessible on local network/phone)
npm run dev -- --host
```

Open `http://localhost:5173/` on your computer, or access the Network URL shown in the terminal (e.g. `http://192.168.1.x:5173/`) on your smartphone connected to the same Wi-Fi.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 How to Deploy

### Option 1: Vercel (Recommended)

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Set Counter PWA"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and select your GitHub repo.
4. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. Your app is live with free HTTPS and PWA support!

### Option 2: Netlify

#### Via Drag & Drop (Fastest):
1. Run `npm run build` in your project folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder directly into the browser window. Done!

#### Via Netlify CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```
