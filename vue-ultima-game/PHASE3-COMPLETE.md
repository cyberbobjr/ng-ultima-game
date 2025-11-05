# Phase 3: Pinia Stores - Completed ✅

**Date**: November 5, 2024
**Branch**: `claude/vue-migration-011CUpQraR6bUrgR2Euh3gDx`

## Résumé

Phase 3 complétée avec succès! Tous les services Angular ont été migrés vers des stores Pinia, implémentant la gestion d'état réactive de Vue.js 3.

## Stores créés

### 7 stores Pinia pour remplacer les services Angular

#### 1. **useUIStore** (`src/stores/useUIStore.ts`)
- **Remplace**: DescriptionsService
- **Responsabilité**: Gestion des messages d'information et logs
- **État**:
  - `informationMessages`: Liste des messages avec couleur et timestamp
  - `maxMessages`: Limite du nombre de messages (100)
- **Actions**:
  - `addTextToInformation()`: Ajoute un ou plusieurs messages
  - `addLogInformation()`: Ajoute un log avec couleur
  - `clearMessages()`: Efface tous les messages
  - `getLastMessages()`: Récupère les N derniers messages

#### 2. **usePartyStore** (`src/stores/usePartyStore.ts`)
- **Remplace**: PartyService
- **Responsabilité**: Gestion du groupe de joueurs
- **État**:
  - `party`: Array des entités du groupe
- **Computed**:
  - `members`: Liste des membres
  - `partySize`: Nombre de membres
  - `hasMembers`: Vérifie si le groupe a des membres
- **Actions**:
  - `addLeader()`: Ajoute le leader
  - `addMember()`: Ajoute un membre
  - `removeMember()`: Retire un membre
  - `isMember()`: Vérifie l'appartenance
  - `clearParty()`: Efface le groupe
  - `getLeader()`: Récupère le leader (premier membre)

#### 3. **useTalkingStore** (`src/stores/useTalkingStore.ts`)
- **Remplace**: TalkingService
- **Responsabilité**: Gestion des conversations avec les NPCs
- **État**:
  - `talker`: Entité qui initie la conversation (joueur)
  - `entityToTalk`: NPC avec qui parler
  - `talkerToBehavior`: Behavior de conversation actif
- **Computed**:
  - `isConversationActive`: true si conversation en cours
- **Actions**:
  - `startNewConversation()`: Démarre une conversation
  - `parseInputTalking()`: Parse l'entrée du joueur
  - `stopConversation()`: Arrête la conversation

#### 4. **useMapStore** (`src/stores/useMapStore.ts`)
- **Remplace**: MapsService + TilesLoaderService
- **Responsabilité**: Gestion des cartes et des tuiles (TRÈS LARGE STORE)
- **État**:
  - `currentMap`: Carte actuellement chargée
  - `mapsMetaData`: Métadonnées de toutes les cartes
  - `tileset`: Ensemble des tuiles
  - `tilesRules`: Règles des tuiles
  - `numberOfTilesLoaded` / `totalTilesToLoad`: Progression du chargement
- **Computed**:
  - `isMapLoaded`: true si carte chargée
  - `areTilesLoaded`: true si toutes les tuiles sont chargées
  - `loadingProgress`: % de progression (0-100)
- **Actions Maps**:
  - `loadMapByFilename()`: Charge une carte par fichier
  - `loadMapByMapId()`: Charge une carte par ID
  - `loadAllMaps()`: Charge toutes les métadonnées
  - `getMapMetadataByMapId()`: Récupère les métadonnées
  - `getTileIndexAtPosition()`: Index de tuile à une position
  - `isTileAtPositionIsWalkable()`: Tuile traversable?
  - `isTileAtPositionIsOpaque()`: Tuile opaque?
  - `isTileAtPositionIsClosedDoor()`: Porte fermée?
  - `isTileAtPositionIsTalkOver()`: Peut parler par dessus?
  - `openDoorAtPosition()`: Ouvre une porte
  - `getPortalForPosition()`: Récupère un portail
- **Actions Tiles**:
  - `loadTiles()`: Charge toutes les tuiles
  - `getTileByIndex()` / `getTileByName()`: Récupère une tuile
  - `isTileWalkable()`: Tuile traversable?
  - `isTileClosedDoor()`: Porte fermée?
  - `getTileSpeed()`: Vitesse de déplacement sur tuile

#### 5. **useEntityStore** (`src/stores/useEntityStore.ts`)
- **Remplace**: EntitiesService
- **Responsabilité**: Gestion de toutes les entités du jeu
- **État**:
  - `entitiesForAllMaps`: Map<mapId, Entity[]> - Entités par carte
  - `player`: Joueur principal
  - `vendors`: Données des marchands
- **Computed**:
  - `hasPlayer`: true si joueur existe
- **Actions**:
  - `initialize()`: Charge les données des vendors
  - `addEntityForMapId()`: Ajoute une entité à une carte
  - `addPlayer()`: Définit le joueur
  - `getPlayer()`: Récupère le joueur
  - `getEntitiesForMapId()`: Entités d'une carte
  - `getEntitiesAtPosition()`: Entités à une position
  - `getEntityAtPosition()`: Première entité à une position
  - `loadAllEntitiesForMaps()`: Charge toutes les entités de toutes les cartes
  - `clearAllEntities()`: Reset

#### 6. **usePlayerStore** (`src/stores/usePlayerStore.ts`)
- **Remplace**: EntityFactoryService
- **Responsabilité**: Création du joueur et des NPCs
- **État**:
  - `player`: Entité joueur
- **Computed**:
  - `hasPlayer`: true si joueur existe
  - `playerPosition`: Position du joueur
- **Actions**:
  - `createOrLoadPlayer()`: Crée ou charge le joueur avec tous ses behaviors
  - `createNpc()`: Crée un NPC avec position, tuile, nom, mouvement
  - `getPlayer()`: Récupère le joueur
  - `savePlayer()`: Sauvegarde la position du joueur

#### 7. **useGameStore** (`src/stores/useGameStore.ts`)
- **Remplace**: ConfigService + ScenegraphService
- **Responsabilité**: Initialisation du jeu et caméra
- **État**:
  - `isInitialized`: true si jeu initialisé
  - `isLoading`: true si chargement en cours
  - `loadingMessage`: Message de chargement
  - `currentMapId`: ID de la carte actuelle
  - `entityCenter`: Entité au centre de la caméra
- **Actions**:
  - `loadConfig()`: Charge la configuration et initialise le jeu
  - `setCenterCameraOnEntity()`: Centre la caméra sur une entité
  - `setMapForEntity()`: Change la carte d'une entité
  - `enterInCity()`: Entre dans une ville
  - `refresh()`: Rafraîchit l'état du jeu

## Corrections TypeScript

### Problème rencontré

TypeScript (vue-tsc) ne reconnaissait pas correctement les types des classes Entity et GameMap dans les stores Pinia, générant des erreurs indiquant que les propriétés privées `_behaviors` et `_getRenderableTile` étaient manquantes.

### Solutions appliquées

1. **Changement des imports** dans Entity.ts et GameMap.ts:
   - `import type { Position }` → `import { Position }`
   - `import type { Entity }` → `import { Entity }`
   - Les classes concrètes doivent être importées normalement, pas avec `import type`

2. **Ajout de type assertions** explicites dans les stores:
   - `return player.value as Entity | null`
   - `return currentMap.value as GameMap | null`
   - `return entities as Entity[]`
   - Ces assertions aident TypeScript à reconnaître les types corrects des refs Pinia

3. **Correction des callbacks lodash**:
   - `_.find()` doit retourner un boolean, pas l'entité elle-même
   - Fixed: `return position.isEqual(entity.getPosition())`

## Architecture

### Réactivité Vue.js

Tous les stores utilisent l'API Composition de Vue.js:
- `ref()` pour l'état mutable
- `computed()` pour les valeurs dérivées
- `defineStore()` de Pinia pour créer les stores

### Avantages vs Angular Services

1. **Réactivité native**: Les composants Vue réagissent automatiquement aux changements
2. **Pas de RxJS**: Plus simple, utilise la réactivité Vue
3. **TypeScript natif**: Meilleure inférence de types
4. **Devtools**: Support Pinia Devtools pour le debugging
5. **Tree-shaking**: Meilleure optimisation du bundle

## Tests effectués

### 1. TypeScript Type Check
```bash
npm run type-check
```
✅ **Résultat**: Aucune erreur TypeScript

### 2. Build Production
```bash
npm run build
```
✅ **Résultat**: Build réussi en 6.88s
- index.js: 99.11 kB (gzipped: 38.71 kB)
- phaser.js: 1,208.06 kB (gzipped: 332.17 kB)

## Structure des fichiers

```
src/stores/
├── useUIStore.ts           # Messages d'information
├── usePartyStore.ts        # Gestion du groupe
├── useTalkingStore.ts      # Conversations NPCs
├── useMapStore.ts          # Cartes et tuiles (420 lignes)
├── useEntityStore.ts       # Toutes les entités (230 lignes)
├── usePlayerStore.ts       # Factory joueur/NPCs
└── useGameStore.ts         # Initialisation du jeu
```

## Métriques

- **7 stores Pinia créés**
- **~1,200 lignes de code** au total
- **Remplacement complet** des services Angular:
  - DescriptionsService → useUIStore
  - PartyService → usePartyStore
  - TalkingService → useTalkingStore
  - MapsService + TilesLoaderService → useMapStore
  - EntitiesService → useEntityStore
  - EntityFactoryService → usePlayerStore
  - ConfigService + ScenegraphService → useGameStore

## Dépendances

### Stores utilisent:
- `pinia` - State management
- `vue` - Réactivité (ref, computed)
- `lodash` - Utilitaires
- Classes ECS:
  - Entity, Position, GameMap, Tileset
  - TalkBehavior, VendorTalkBehavior
  - Tous les behaviors pour la création d'entités

## Prochaines étapes (Phase 4)

Phase 4 consistera à:
1. Intégrer les stores avec les scènes Phaser
2. Créer les scènes de jeu principales:
   - GameScene (carte principale)
   - UIScene (overlay interface)
   - LoadingScene (écran de chargement)
3. Connecter le rendu Phaser avec le système ECS
4. Implémenter la boucle de jeu

## Notes techniques

### Type Assertions nécessaires

En raison d'une limitation de vue-tsc avec les refs Pinia contenant des instances de classes, nous avons dû ajouter des type assertions explicites (`as Entity`, `as GameMap`) dans certains retours de fonctions. C'est une solution de contournement standard et sûre car:

1. Les refs sont explicitement typés à la déclaration: `ref<Entity | null>(null)`
2. Les valeurs assignées sont toujours des instances de classe: `new Entity()`, `new GameMap()`
3. Les assertions ne font que confirmer à TypeScript ce qui est déjà garanti par le code

### Performance

Les stores Pinia sont optimisés pour la performance:
- Réactivité granulaire (seules les dépendances changent)
- Computed values memoizées
- Pas de souscription RxJS à gérer

---

**Status**: ✅ Phase 3 COMPLÉTÉE
**Build**: ✅ SUCCÈS
**TypeScript**: ✅ AUCUNE ERREUR
**Prêt pour**: Phase 4 - Intégration Phaser
