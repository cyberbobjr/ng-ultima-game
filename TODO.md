# NgUltimaGame - TODO List

**Project:** Migration from Angular to Vue.js 3 + Phaser 3
**Current Branch:** `claude/vue-migration-011CUpQraR6bUrgR2Euh3gDx`
**Last Updated:** 2025-11-06

---

## ✅ Phase 1: Vue.js Setup (COMPLETED)

- [x] Create Vue 3 project with Vite
- [x] Setup TypeScript configuration
- [x] Install dependencies (Phaser 3, Pinia, Lodash)
- [x] Configure project structure
- [x] Setup development server

---

## ✅ Phase 2: ECS Architecture Migration (COMPLETED)

### Core Classes
- [x] Migrate `Position` class
- [x] Migrate `Entity` class
- [x] Migrate `GameMap` class
- [x] Migrate `Tileset` class

### Behaviors
- [x] Migrate `PositionBehavior`
- [x] Migrate `RenderableBehavior`
- [x] Migrate `MovableBehavior`
- [x] Migrate `TalkBehavior`
- [x] Migrate `VendorTalkBehavior`
- [x] Migrate `AIBehavior`

### Systems
- [x] Migrate `MovementSystem`
- [x] Migrate `KeyboardInputSystem`
- [x] Migrate `RenderableSystem`
- [x] Migrate `AISystem`
- [x] Migrate `VisibilitySystem` (FOV with shadowcasting)

---

## ✅ Phase 3: Pinia Stores (COMPLETED)

- [x] `useMapStore` - Map and tile management (replaces MapsService + TilesLoaderService)
- [x] `useEntityStore` - Entity management (replaces EntitiesService)
- [x] `usePlayerStore` - Player creation (replaces EntityFactoryService)
- [x] `useGameStore` - Game initialization (replaces ConfigService + ScenegraphService)
- [x] `useUIStore` - UI messages (replaces DescriptionsService)
- [x] `usePartyStore` - Party management (replaces PartyService)
- [x] `useTalkingStore` - Conversations (replaces TalkingService)

---

## ✅ Phase 4: Phaser 3 Integration (COMPLETED)

### Scenes
- [x] Create `GameScene` - Main game rendering
- [x] Create `UIScene` - UI overlay
- [x] Create `LoadingScene` - Loading screen with progress bar
- [x] Setup Phaser game configuration

### Rendering
- [x] Tile rendering with sprite grid
- [x] Entity rendering (player, NPCs)
- [x] Camera system following player
- [x] FOV fog rendering with Graphics object
- [x] Optimized lazy sprite destruction (<1s map loading)

---

## ✅ Phase 5: Core Gameplay Features (COMPLETED)

### Movement & Display
- [x] Arrow key movement
- [x] Collision detection with tiles
- [x] Collision detection with entities
- [x] Camera following with smooth transitions
- [x] Multiple maps support (world map, cities, dungeons)

### Field of Vision (FOV)
- [x] Shadowcasting algorithm implementation
- [x] 8-tile radius visibility
- [x] Opaque tiles blocking vision (mountains, forests)
- [x] Zone-based fog of war for unvisited areas
- [x] Performance optimization (removed debug logs)

### Map Transitions
- [x] Portal detection on movement
- [x] Manual portal activation with 'E' key (enter cities/dungeons)
- [x] Automatic exit from cities (1 tile from border) **Updated 2025-11-06**
- [x] Save/load world map entry positions
- [x] Fix race condition (black screen during map loading)

### Persistence
- [x] Auto-save player position after movement
- [x] LocalStorage integration
- [x] Load correct map on page refresh

### Interactive Actions
- [x] Door opening/closing with 'O' key
  - [x] Detect doors in 4 directions
  - [x] Replace door with brick_floor (walkable)
  - [x] Auto-close after 1.5 seconds
  - [x] Refresh display on open and close
- [x] NPC dialogue system with 'T' key
  - [x] Detect NPCs in 4 directions
  - [x] Support 'talk' and 'vendortalk' behaviors
  - [x] Integration with useTalkingStore
- [x] Klimb system with 'K' key
  - [x] Implement `checkAndKlimb()` in MovementSystem
  - [x] Detect portals with action="klimb"
  - [x] Trigger map transition to upper level
  - [x] Add callback in KeyboardInputSystem
  - [x] Wire callback in GameScene
  - [x] Display contextual messages ("Klimb what?")
- [x] Descend system with 'D' key
  - [x] Implement `checkAndDescend()` in MovementSystem
  - [x] Detect portals with action="descend"
  - [x] Trigger map transition to lower level
  - [x] Add callback in KeyboardInputSystem
  - [x] Wire callback in GameScene
  - [x] Display contextual messages ("Descend what?")

---

## 🚧 Phase 6: Conversation & Quest Systems (IN PROGRESS)

### Conversation Enhancement
- [ ] Full conversation tree implementation with branching
- [ ] Keyword-based dialogue responses (parse user input)
- [ ] Vendor dialogue system integration (buy/sell)
- [ ] Quest system hooks and tracking
- [ ] Dialogue history and state persistence

---

## 📋 Phase 7: Game Systems (NOT STARTED)

### Inventory System
- [ ] Create inventory store
- [ ] Item data models
- [ ] Pickup items with 'G' key (Get)
- [ ] Drop items
- [ ] Use items with 'U' key
- [ ] Equipment system
- [ ] Inventory UI display

### Combat System
- [ ] Turn-based combat implementation
- [ ] Attack command with 'A' key
- [ ] Enemy AI in combat
- [ ] Damage calculation
- [ ] Death and respawn
- [ ] Combat UI

### Magic System
- [ ] Spell data models
- [ ] Cast spell with 'C' key
- [ ] Mana/MP management
- [ ] Spell effects
- [ ] Spell learning system

### Party Management
- [ ] Recruit NPCs to party
- [ ] Party member status display
- [ ] Party formation in combat
- [ ] Party AI in exploration

---

## 📋 Phase 8: Advanced Features (NOT STARTED)

### Game Mechanics
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Dynamic lighting
- [ ] Torch/light sources
- [ ] Food and health regeneration
- [ ] Karma/virtue system (Ultima IV specific)

### Audio
- [ ] Background music system
- [ ] Sound effects for actions
- [ ] Ambient sounds
- [ ] Music per map/situation

### UI Enhancements
- [ ] Minimap display
- [ ] Status bars (HP, MP)
- [ ] Quick action buttons
- [ ] Settings menu
- [ ] Save/load game menu

---

## 🐛 Known Issues & Fixes

### Fixed Issues
- ✅ Long map loading times (~19.6s) → Fixed with lazy sprite destruction
- ✅ Black screen when entering cities → Fixed race condition with isLoadingMap flag
- ✅ Spawn in ocean after page reload → Fixed by loading saved mapId
- ✅ Console spam causing lag → Removed debug logs from VisibilitySystem
- ✅ Architecture violation: E key in GameScene → Refactored to KeyboardInputSystem callbacks
- ✅ Door detection using wrong positions → Fixed with addVector() for absolute positions
- ✅ Door opening not working visually → Fixed by replacing with brick_floor instead of door tile
- ✅ UIScene Phaser crash on klimb/descend → Added scene state checks and try-catch in text updates
- ✅ "Cannot read properties of null (reading 'drawImage')" error → Protected updateInfoDisplay and updateStatsDisplay

### Open Issues
- None currently

### Recent Changes (2025-11-06)
- 🔧 **Border exit detection**: Changed from 2 tiles to 1 tile from edge
- 🔧 **UIScene robustness**: Added scene state validation before updating Phaser text objects
- 🔧 **Error handling**: Wrapped text updates in try-catch to prevent crashes during map transitions

---

## 🎯 Next Immediate Tasks (Priority Order)

1. **Full conversation tree** - Keyword-based dialogue system with branching
2. **Vendor dialogue system** - Buy/sell items integration
3. **Inventory system basics** - Get (G) and Use (U) items
4. **Combat system** - Attack (A) and enemy encounters
5. **Magic system** - Cast (C) spells

---

## 📊 Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Vue Setup | ✅ Complete | 100% |
| Phase 2: ECS Migration | ✅ Complete | 100% |
| Phase 3: Pinia Stores | ✅ Complete | 100% |
| Phase 4: Phaser Integration | ✅ Complete | 100% |
| Phase 5: Core Gameplay | ✅ Complete | 100% |
| Phase 6: Conversation & Quests | 🚧 In Progress | 15% |
| Phase 7: Game Systems | 📋 Not Started | 0% |
| Phase 8: Advanced Features | 📋 Not Started | 0% |

**Overall Project Completion: ~67%**

---

## 🏗️ Architecture Notes

### ECS Pattern
All gameplay actions follow the Entity-Component-System pattern:
- **Input** → KeyboardInputSystem
- **Logic** → MovementSystem (or other systems)
- **Callback** → GameScene (for rendering updates)

### Callback Pattern Example
```typescript
// GameScene.ts
keyboardInputSystem.setOnDoorOpenRequested((entity) => {
  const doorOpened = movementSystem.checkAndOpenDoor(entity, onDoorClosed)
  if (doorOpened) {
    this.refreshTileSprites()
  }
})
```

### Store Responsibilities
- **MapStore**: Map data, tiles, portals, doors
- **EntityStore**: All entities (player, NPCs, items)
- **PlayerStore**: Player creation/factory
- **TalkingStore**: Conversation state
- **UIStore**: Messages and logs
- **GameStore**: Game initialization

---

## 📝 Development Notes

### Performance Optimizations Applied
1. Lazy sprite destruction (hide immediately, destroy later)
2. FOV computed only when needed (blocked during map loading)
3. Zone-based fog rendering (1 Graphics object instead of 1024+ Rectangles)
4. Tile sprite caching during refresh
5. Removed debug logs from game loop

### Code Quality
- TypeScript strict mode enabled
- No type errors in build
- ECS architecture properly separated
- Pinia stores following Vue 3 Composition API
- Consistent callback patterns for decoupling

---

## 🔗 Related Documents

- [README.md](./README.md) - Project overview and setup instructions
- [PHASE3-COMPLETE.md](./vue-ultima-game/PHASE3-COMPLETE.md) - Detailed Phase 3 completion report

---

**Last Commit:** `9ad18fb` - Feature: Implement Klimb and Descend systems + TODO.md
**Last Updated:** 2025-11-06
