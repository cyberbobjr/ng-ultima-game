# Ultima IV - Vue.js + Phaser 3 Migration

RPG game inspired by Ultima IV, migrated from Angular to Vue.js 3 with Phaser 3 rendering engine.

## 🚀 Quick Start

### Development Mode

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

**⚠️ IMPORTANT**: The dev server MUST be running for the game to work. Assets in the `public/` folder are only accessible when the dev server is active.

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

### Assets not loading

**Problem**: Console shows errors like "Failed to process file: image 'tile_xxx'"

**Solution**: Make sure the dev server is running with `npm run dev`

The dev server must be running for files in the `public/` folder to be accessible.
Without it, the browser will get 404 errors when trying to load PNG and JSON files.

### JSON parsing errors

**Problem**: "SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON"

**Solution**: This happens when the dev server returns HTML instead of JSON.
Make sure you've started the dev server with `npm run dev` before opening the game.

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
