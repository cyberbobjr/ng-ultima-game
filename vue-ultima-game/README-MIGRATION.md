# 🎮 Ultima Game - Migration Vue.js + Phaser

## 📊 État de la Migration

### ✅ Phase 1 - Initialisation du Projet (TERMINÉE)

**Date de complétion:** 2025-11-05

**Objectifs atteints:**
- [x] Création du projet Vue.js 3 avec Vite
- [x] Installation de Phaser 3
- [x] Installation de Pinia pour la gestion d'état
- [x] Configuration TypeScript
- [x] Configuration ESLint et Prettier
- [x] Création de la structure de dossiers
- [x] Composant de test Phaser fonctionnel
- [x] Configuration Vite optimisée pour Phaser

**Technologies installées:**
- Vue.js 3.4+
- Phaser 3.80+
- Pinia 2.1+
- TypeScript 5.3+
- Vite 5.0+
- Lodash 4.17+

---

## 📁 Structure du Projet

```
vue-ultima-game/
├── src/
│   ├── game/                      # Logique de jeu pure (framework-agnostic)
│   │   ├── ecs/                   # Entity-Component-System
│   │   │   ├── entities/          # Entités du jeu
│   │   │   ├── behaviors/         # Comportements (14 types)
│   │   │   └── systems/           # Systèmes de traitement (5 systèmes)
│   │   ├── phaser/                # Intégration Phaser
│   │   │   ├── scenes/
│   │   │   │   └── TestScene.ts   # ✅ Scène de test
│   │   │   └── config.ts          # ✅ Configuration Phaser
│   │   ├── models/                # Classes de données
│   │   │   └── interfaces/
│   │   └── data/                  # Gestion des données
│   │
│   ├── stores/                    # Pinia stores (à créer en Phase 3)
│   ├── composables/               # Hooks Vue réutilisables (à créer)
│   ├── components/
│   │   └── PhaserGame.vue         # ✅ Conteneur Phaser
│   ├── App.vue                    # ✅ Composant racine modifié
│   └── main.ts                    # Point d'entrée
│
├── package.json                   # ✅ Dépendances installées
├── vite.config.ts                 # ✅ Configuration Vite optimisée
└── tsconfig.json                  # ✅ Configuration TypeScript
```

---

## 🚀 Démarrage du Projet

### Installation
```bash
cd vue-ultima-game
npm install
```

### Développement
```bash
npm run dev
```

Le serveur de développement démarrera sur http://localhost:5173

### Build de Production
```bash
npm run build
```

### Preview de la Build
```bash
npm run preview
```

---

## 📋 Prochaines Phases

### Phase 2 - Migration du Système ECS (3-4h)
- [ ] Migrer les classes de base (Entity, Position, GameMap, Tileset)
- [ ] Migrer les 14 Behaviors
- [ ] Migrer les 5 Systems
- [ ] Adapter pour éliminer les dépendances Angular

### Phase 3 - Migration des Services vers Pinia Stores (2-3h)
- [ ] Créer useEntityStore
- [ ] Créer useMapStore
- [ ] Créer usePlayerStore
- [ ] Créer usePartyStore
- [ ] Créer useTalkingStore
- [ ] Créer useUIStore
- [ ] Créer useGameStore

### Phase 4 - Intégration Phaser - Scènes de Base (3-4h)
- [ ] Créer GameScene (scène principale)
- [ ] Créer UIScene (overlay UI)
- [ ] Créer StartScene (écran d'accueil)
- [ ] Configurer le système de tilemap

### Phase 5 - Système de Rendu avec Phaser (4-5h)
- [ ] Convertir/adapter les maps JSON
- [ ] Créer GameManager (bridge ECS ↔ Phaser)
- [ ] Implémenter le FOV
- [ ] Gérer les sprites et animations

### Phase 6 - Migration des Composants UI (3-4h)
- [ ] Créer GameScreen.vue
- [ ] Créer PartyPanel.vue
- [ ] Créer InfoPanel.vue
- [ ] Créer TalkingDialog.vue
- [ ] Créer InventoryPanel.vue
- [ ] Créer StartScreen.vue

### Phase 7 - Gestion des Inputs et Boucle de Jeu (2-3h)
- [ ] Implémenter la gestion des inputs Phaser
- [ ] Créer le composable useGameLoop
- [ ] Intégrer la boucle de jeu avec les Systems ECS

### Phase 8 - Migration des Données et Assets (2-3h)
- [ ] Migrer les assets (maps, tiles, NPCs)
- [ ] Adapter les loaders de données
- [ ] Migrer le système de sauvegarde

### Phase 9 - Tests, Optimisations et Finalisation (3-4h)
- [ ] Tests fonctionnels complets
- [ ] Optimisations de performance
- [ ] Documentation
- [ ] Déploiement

---

## 🎯 Vérification Phase 1

Pour vérifier que la Phase 1 est complète :

1. ✅ Le serveur dev démarre sans erreurs
2. ✅ Le canvas Phaser s'affiche dans le navigateur
3. ✅ Une grille de tuiles vertes de test est visible
4. ✅ Le titre et les messages s'affichent correctement
5. ✅ Aucune erreur dans la console du navigateur

---

## 📝 Notes Techniques

### Configuration Phaser
- Type: AUTO (WebGL avec fallback Canvas)
- Résolution: 320x320 (10x10 tiles de 32px)
- Physique: Arcade (sans gravité pour le RPG top-down)
- Rendu: Pixel art activé, antialias désactivé
- FPS cible: 60

### Configuration Vite
- Port: 5173
- Ouverture automatique du navigateur
- Chunk manuel pour Phaser (optimisation du build)

---

## 🐛 Problèmes Connus

Aucun pour le moment.

---

## 📚 Références

- [Vue.js Documentation](https://vuejs.org/)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

---

**Dernière mise à jour:** 2025-11-05
