# Windows 11 Setup Guide

Complete setup instructions for running the Ultima IV game on Windows 11.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/download/win)

## Quick Start

### Option 1: With Backend (Real Assets) - Recommended

**Step 1: Start Backend Server**

Open PowerShell or Command Prompt:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Or simply double-click: `backend\start.bat`

You should see:
```
🚀 Starting Ultima IV Assets Server...
✅ Starting server at http://localhost:8000
```

**Keep this terminal open!**

**Step 2: Configure Frontend**

In a **new** terminal:
```cmd
cd vue-ultima-game
copy .env.example .env
```

Edit `.env` file (use Notepad or VS Code):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

**Step 3: Start Frontend Dev Server**

```cmd
npm install
npm run dev
```

**Important:** If dev server was already running, you **MUST** restart it:
- Press `Ctrl+C` to stop
- Run `npm run dev` again
- This is required for Vite to read the `.env` file

**Step 4: Open Browser**

Open: http://localhost:5173

You should see the game loading **without warnings** and with real Ultima assets!

### Option 2: Fallback Mode (No Backend)

Edit `.env`:
```bash
VITE_API_BASE_URL=
```

Restart dev server:
```cmd
npm run dev
```

The game will use generated tiles and procedural maps.

## Troubleshooting

### Issue: Assets still loading from localhost:5173

**Symptom:**
- Browser shows: `http://localhost:5173/assets/npcs/vendors.json`
- Console shows: "Failed to load" errors

**Solution:**
1. Verify `.env` file exists in `vue-ultima-game\` folder
2. Verify it contains: `VITE_API_BASE_URL=http://localhost:8000`
3. **RESTART the dev server** (Ctrl+C, then `npm run dev`)
4. Hard refresh browser: `Ctrl+F5`

**Why this happens:**
- Vite only reads `.env` at startup
- Running dev servers won't pick up changes
- Must restart to apply new environment variables

### Issue: Backend server won't start

**Error:** `'python' is not recognized`

**Solution:**
```cmd
py -m venv venv
venv\Scripts\activate
py -m pip install -r requirements.txt
py main.py
```

Windows sometimes installs Python as `py` instead of `python`.

### Issue: Port 8000 already in use

**Solution:**
Find and kill the process:
```cmd
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

Or use a different port:
```cmd
python main.py --port 8001
```

Then update `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8001
```

### Issue: CORS errors in browser

**Symptom:** Console shows "CORS policy blocked"

**Solution:**
1. Backend is already configured for CORS
2. Make sure backend is running: `curl http://localhost:8000/health`
3. Check browser console - actual URL being requested
4. Verify `.env` has correct URL (no trailing slash)

### Issue: Virtual environment activation fails

**PowerShell Error:** "execution of scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then retry:
```powershell
venv\Scripts\Activate.ps1
```

## Testing Backend

### Using Browser
Open: http://localhost:8000/health

Should show:
```json
{
  "status": "healthy",
  "file_counts": {
    "tiles": 135,
    "maps": 18,
    "npcs": 18
  }
}
```

### Using PowerShell
```powershell
Invoke-WebRequest -Uri http://localhost:8000/health | Select-Object Content
```

### Using curl (if installed)
```cmd
curl http://localhost:8000/health
```

## Common Windows Paths

- **Backend:** `C:\path\to\ng-ultima-game\backend\`
- **Frontend:** `C:\path\to\ng-ultima-game\vue-ultima-game\`
- **Assets:** `C:\path\to\ng-ultima-game\vue-ultima-game\public\`

## IDE Setup (VS Code)

### Recommended Extensions
- **Volar** - Vue 3 support
- **Python** - Python support
- **Prettier** - Code formatting
- **ESLint** - JavaScript linting

### Open Project
1. Open VS Code
2. File → Open Folder
3. Select `ng-ultima-game` folder

### Integrated Terminal
- View → Terminal (Ctrl+`)
- Can split terminal for backend + frontend
- Right-click terminal tab → Split Terminal

## Running Both Servers

### Option A: Two Terminals (Recommended)

**Terminal 1:**
```cmd
cd backend
python main.py
```

**Terminal 2:**
```cmd
cd vue-ultima-game
npm run dev
```

### Option B: VS Code Split Terminal

1. Open integrated terminal (Ctrl+`)
2. Click the split icon (or Ctrl+Shift+5)
3. Run backend in one, frontend in other

### Option C: Windows Terminal (Windows 11)

1. Open Windows Terminal
2. Ctrl+Shift+T to open new tab
3. Tab 1: Backend
4. Tab 2: Frontend

## Environment Variables

### Checking if .env is loaded

Add this to `vue-ultima-game\src\main.ts` temporarily:
```typescript
console.log('🔍 API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
```

Restart dev server and check browser console.

Should show: `🔍 API_BASE_URL: http://localhost:8000`

### .env File Rules

- Must be in `vue-ultima-game\` folder (same level as `package.json`)
- Must be named exactly `.env` (no `.txt` extension)
- Must start with `VITE_` prefix for Vite to expose it
- Changes require dev server restart

## Production Build (Windows)

```cmd
cd vue-ultima-game
npm run build
```

Output: `vue-ultima-game\dist\`

Serve with any static server:
```cmd
cd dist
python -m http.server 3000
```

Or use `serve`:
```cmd
npm install -g serve
serve dist -p 3000
```

## Firewall

If backend can't be accessed from browser:

1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Add Python (`python.exe`)
4. Allow on Private networks

## Performance Tips

### Faster Backend Startup
Use PowerShell profile to keep venv activated:
```powershell
# Edit: notepad $PROFILE
cd C:\path\to\ng-ultima-game\backend
.\venv\Scripts\Activate.ps1
```

### Faster npm install
Use pnpm instead of npm:
```cmd
npm install -g pnpm
pnpm install
pnpm run dev
```

## Scripts Summary

### Backend
```cmd
cd backend
start.bat           # Start with auto-setup (Windows)
python main.py      # Direct start (after setup)
```

### Frontend
```cmd
cd vue-ultima-game
npm install         # Install dependencies
npm run dev         # Start dev server
npm run build       # Production build
npm run type-check  # TypeScript check
```

## Getting Help

If you're stuck:

1. Check this guide's Troubleshooting section
2. Check browser DevTools console (F12)
3. Check backend terminal for errors
4. Verify both servers are running
5. Try fallback mode (empty `VITE_API_BASE_URL`)

## Next Steps

Once everything is running:
1. Open http://localhost:5173
2. Game should load with real assets
3. Use arrow keys to move player
4. Check console - should be no red errors
5. Ready to develop!

---

**Status:** ✅ Windows 11 Compatible
**Tested:** Python 3.11, Node.js 20, Windows 11 23H2
