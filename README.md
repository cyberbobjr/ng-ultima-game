# NgUltimaGame

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Summary
ng-ultima-game is a proof-of-concept game engine inspired by Ultima 4, now migrated to modern web technologies:
- **Vue 3** + **Phaser 3** game engine (migrated from Angular)
- **Pinia** for state management
- **Entity-Component-System** (ECS) architecture
- **TypeScript** for type safety

For your pleasure, I used the Ultima 4 tiles and game concept. This is an ongoing project to recreate the full Ultima 4 experience in a modern web framework.

### Keyboard Controls
- **Arrow Keys**: Move your character
- **E**: Enter portals (cities, dungeons) on the world map
- **O**: Open/close doors
- **T**: Talk to NPCs
- **K**: Klimb (coming soon)
- **D**: Descend (coming soon)

![logo](https://github.com/cyberbobjr/ng-ultima-game/blob/9b48fee3e44404c69cb3259154019f527d0f4f9c/docs/ng-ultima-poc.gif?raw=true "screenshot")

## Installation
Navigate to the Vue version of the project:
```bash
cd vue-ultima-game
npm install
```

## Development server

To run the **frontend** (Vue + Phaser):
```bash
cd vue-ultima-game
npm run dev
```
Navigate to `http://localhost:5173/` (or the port shown in the terminal). The app will automatically reload if you change any of the source files.

To load **real game assets** (tiles, maps), you also need to run the backend server:
```bash
cd server
npm install
npm start
```
The backend serves assets on `http://localhost:3000/`. Configure `VITE_API_BASE_URL` in `.env` to point to the backend.

**Note:** The game works without the backend using fallback generated tiles, but real assets provide the authentic Ultima 4 experience.

## Build

Run `npm run build` in the `vue-ultima-game` directory to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests - not yet coded

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests - not yet coded

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Features

### ✅ Implemented Features (Phase 1-2 Complete)

**Core Movement & Display:**
- ✅ Move your player with arrow keys
- ✅ Display tiles & map with Phaser 3 engine
- ✅ Field of Vision (FOV) system with shadowcasting algorithm
- ✅ Hide opaque tiles behind obstacles (mountains, forests)
- ✅ Zone-based fog of war for unvisited areas
- ✅ Manage walkable/blockable tiles
- ✅ Camera following player with smooth transitions

**Map System:**
- ✅ Multiple maps support (world map, cities, dungeons)
- ✅ Portal activation with 'E' key (manual entry to cities/dungeons)
- ✅ Automatic exit from cities on border (2 tiles from edge)
- ✅ Save/load world map entry positions
- ✅ Door opening/closing with 'O' key
- ✅ Fast map loading with lazy sprite destruction (<1s)

**Entity & State Management:**
- ✅ ECS (Entity-Component-System) architecture
- ✅ Save state of player (position on the map)
- ✅ Auto-save after movement
- ✅ NPCs visible on map
- ✅ Collision detection with entities

**User Interface:**
- ✅ GUI Screen ready
- ✅ Simili responsive (for width only)
- ✅ Loading screen with progress bar

**Phase 3 - Dialogue System (Just Implemented):**
- ✅ Talk to NPCs with 'T' key
- ✅ Find NPCs in 4 directions (up, down, left, right)
- ✅ Conversation system with useTalkingStore
- ✅ Support for 'talk' and 'vendortalk' behaviors

### 🚧 In Progress / Coming Soon

**Phase 3 - Advanced Interactions:**
- 🚧 Klimb system ('K' key) - for climbing ladders/mountains
- 🚧 Descend system ('D' key) - for going down stairs/holes
- 🚧 Full conversation tree implementation
- 🚧 Vendor dialogue system
- 🚧 Quest system integration

**Future Features:**
- 📋 Inventory system
- 📋 Combat system
- 📋 Magic system
- 📋 Party management (multiple characters)
- 📋 Day/night cycle
- 📋 Weather effects
- 📋 Sound effects and music

## Licence
This project is under GNU GENERAL PUBLIC LICENS, see licence.txt for details
Some assets comes from XU4 - https://sourceforge.net/projects/xu4/

## Long roadmap feature
In the end of the end, the game will be more a "tile game engine" which you can modify all options as you want.
Maybe with a quest system ??