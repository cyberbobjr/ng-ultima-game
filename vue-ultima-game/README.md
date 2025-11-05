# Ultima IV - Vue.js + Phaser 3 Migration

RPG game inspired by Ultima IV, migrated from Angular to Vue.js 3 with Phaser 3 rendering engine.

## 🚀 Quick Start

### Option 1: Using Vite Dev Server (Recommended for Development)

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Open your browser**:
   - The dev server will display the URL (usually http://localhost:5173)
   - Open it in your browser
   - The game will start loading automatically

### Option 2: Using Python Backend (Recommended for Production)

For serving assets to a production build or when you don't want to run the full Vite dev server:

**Terminal 1 - Start Backend:**
```bash
cd ../backend
./start.sh  # Or: python main.py
```

Backend will run at http://localhost:8000

**Terminal 2 - Configure & Build Frontend:**
```bash
# Update asset URLs to use backend (or configure via env vars)
npm run build
# Serve dist folder with any static server
```

See [../backend/README.md](../backend/README.md) for detailed backend documentation.

**Note**: The game includes fallback systems that allow it to run even when assets can't be loaded (useful for development without server).

### Environment Configuration

The game uses environment variables to configure the backend API URL:

**1. Copy the example file:**
```bash
cp .env.example .env
```

**2. Configure for your needs:**

**Option A: Use FastAPI Backend** (loads real Ultima assets)
```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```
Then start the backend: `cd ../backend && python main.py`

**Option B: Fallback Mode** (uses generated tiles/maps, no backend needed)
```bash
# .env
VITE_API_BASE_URL=
```

**Option C: Production Backend**
```bash
# .env
VITE_API_BASE_URL=https://your-api.example.com
```

**Important**: After changing `.env`, restart the dev server (`npm run dev`).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Type Checking

```bash
npm run type-check
```

## 🎮 Controls

- **Arrow Keys** (⬆️⬇️⬅️➡️) - Move player
- **E** - Enter portals/cities (coming in Phase 6)
- **O** - Open doors (coming in Phase 6)
- **T** - Talk to NPCs (coming in Phase 6)
- **K** - Climb up ladders (coming in Phase 6)
- **D** - Descend ladders (coming in Phase 6)
- **ESC** - Close dialogues (coming in Phase 6)

## 📁 Project Structure

```
vue-ultima-game/
├── public/                 # Static assets served at root
│   ├── tiles/             # 140+ PNG tile images (16x16px)
│   ├── maps/              # 17 map files (.map format)
│   ├── npcs/              # NPC dialogue JSON files
│   ├── tiles.json         # Tile definitions
│   ├── tiles_rules.json   # Walkability rules
│   └── maps.json          # Map metadata and portals
├── src/
│   ├── game/
│   │   ├── ecs/          # Entity-Component-System
│   │   │   ├── behaviors/    # Entity behaviors (14 files)
│   │   │   ├── entities/     # Entity class
│   │   │   └── systems/      # Game systems (5 files)
│   │   ├── models/       # Data models (Position, GameMap, etc.)
│   │   └── phaser/       # Phaser 3 integration
│   │       ├── config.ts       # Phaser configuration
│   │       └── scenes/         # Phaser scenes
│   │           ├── LoadingScene.ts
│   │           ├── GameScene.ts
│   │           └── UIScene.ts
│   ├── stores/           # Pinia stores (7 files)
│   ├── components/       # Vue components
│   └── App.vue          # Root component
└── package.json
```

## 🛠️ Technology Stack

- **Vue.js 3** - UI framework with Composition API
- **Phaser 3** - 2D game engine for canvas rendering
- **Pinia** - State management (replaces Angular services)
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

## 📊 Migration Progress

- ✅ **Phase 1**: Vue.js + Phaser project initialized
- ✅ **Phase 2**: ECS architecture migrated (31 files)
- ✅ **Phase 3**: Pinia stores created (7 stores)
- ✅ **Phase 4**: Phaser integration (3 scenes)
- ✅ **Phase 5**: Real assets + keyboard controls
- ⏳ **Phase 6**: Portals, doors, NPCs, conversations
- ⏳ **Phase 7**: Combat system
- ⏳ **Phase 8**: Polish and optimization
- ⏳ **Phase 9**: Final testing

## ✨ Current Features

✅ World map (256x256 tiles) rendering
✅ Player character (avatar) with movement
✅ Arrow key controls
✅ Camera following player
✅ 150+ real Ultima tile textures
✅ ECS architecture (AI, Movement, Rendering systems)
✅ Pinia stores for state management
✅ Vue.js reactive UI overlay

## 🐛 Troubleshooting

### Assets not loading (legacy issue - now fixed)

**Note**: As of Phase 5.1, the game includes comprehensive fallback systems that allow it to run even without assets.

**What happens**: If assets can't be loaded (dev server not running), the game will:
- Generate colored fallback tiles automatically (11 tile types)
- Create a 32x32 test map with grass, water, and forests
- Use default tile rules and map metadata
- Continue to function normally, though without real Ultima graphics

**For real assets**: Start the dev server with `npm run dev` to load authentic Ultima IV graphics (150+ PNG tiles, 17 maps, NPC dialogues).

### JSON parsing errors (legacy issue - now fixed)

**Note**: As of Phase 5.1, all stores have error handling with fallback data.

JSON parsing errors are automatically caught and handled gracefully. The game will use fallback data structures and display warnings in the console, but continue to function.

### Game doesn't start

**Problem**: Black screen or loading screen stuck

**Solution**:
1. Check the browser console for errors
2. Make sure the dev server is running
3. Try refreshing the page (Ctrl+F5)
4. Clear browser cache if needed

### AudioContext warning

**Problem**: "The AudioContext was not allowed to start"

**Solution**: This is a browser security feature. Just click anywhere on the page to enable audio.
This is normal and doesn't affect gameplay.

## 📚 Documentation

- **PHASE1-COMPLETE.md** - Initial setup documentation
- **PHASE2-COMPLETE.md** - ECS migration details
- **PHASE3-COMPLETE.md** - Pinia stores documentation
- **PHASE4-COMPLETE.md** - Phaser integration guide
- **PHASE5-COMPLETE.md** - Assets and controls implementation
- **README-MIGRATION.md** - Original migration plan

## 🔧 Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Recommended Browser Extensions

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 📝 License

This is a fan project inspired by Ultima IV. Original Ultima IV © Origin Systems / Electronic Arts.
