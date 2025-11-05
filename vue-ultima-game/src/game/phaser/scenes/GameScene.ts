import Phaser from 'phaser'
import { useMapStore } from '@/stores/useMapStore'
import { useEntityStore } from '@/stores/useEntityStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useGameStore } from '@/stores/useGameStore'
import { Entity } from '@/game/ecs/entities/Entity'
import { RenderableSystem } from '@/game/ecs/systems/RenderableSystem'
import { AISystem } from '@/game/ecs/systems/AISystem'
import { KeyboardInputSystem } from '@/game/ecs/systems/KeyboardInputSystem'
import { MovementSystem } from '@/game/ecs/systems/MovementSystem'
import { VisibilitySystem } from '@/game/ecs/systems/VisibilitySystem'
import type { PositionBehavior } from '@/game/ecs/behaviors/PositionBehavior'
import { TILE_SIZE, HALF_TILE } from '@/game/constants'
import { Position } from '@/game/models/Position'

/**
 * GameScene - Scène principale du jeu
 * Gère le rendu de la carte, des entités et la boucle de jeu
 */
export class GameScene extends Phaser.Scene {
  // Stores Pinia
  private mapStore = useMapStore()
  private entityStore = useEntityStore()
  private playerStore = usePlayerStore()
  private gameStore = useGameStore()

  // Phaser objects
  private tileSprites: Phaser.GameObjects.Sprite[][] = []
  private fogGraphics: Phaser.GameObjects.Graphics | null = null
  private currentMapWidth: number = 0
  private currentMapHeight: number = 0
  private isLoadingMap: boolean = false // Flag pour bloquer updateVisibility pendant le chargement

  // Sprites pour les entités
  private entitySprites: Map<string, Phaser.GameObjects.Sprite> = new Map()

  // ECS Systems
  private renderableSystem!: RenderableSystem
  private aiSystem!: AISystem
  private keyboardInputSystem!: KeyboardInputSystem
  private movementSystem!: MovementSystem
  private visibilitySystem!: VisibilitySystem

  // Visibility settings
  private readonly VISION_RADIUS = 8 // Rayon de vision en tiles
  private debugLogCounter = 0 // Pour limiter les logs de debug

  constructor() {
    super({ key: 'GameScene' })
  }

  async create(): Promise<void> {
    console.log('GameScene: Creating...')

    try {
      // Initialiser les systèmes ECS
      this.initializeSystems()

      // Créer ou charger le joueur
      await this.createPlayer()

      // Charger la carte initiale
      await this.loadMap(0) // Carte 0 par défaut

      // Créer les entités sur la carte
      await this.createEntitiesForCurrentMap()

      // Configurer la caméra
      this.setupCamera()

      // Configurer les contrôles clavier
      this.setupKeyboardControls()

      // Configurer la détection de portails
      this.setupPortalDetection()

      // Calculer la visibilité initiale
      this.updateVisibility()

      // Lancer l'UI Scene en parallèle
      this.scene.launch('UIScene')

      console.log('GameScene: Ready!')
    } catch (error) {
      console.error('GameScene: Error during creation:', error)
    }
  }

  /**
   * Initialise les systèmes ECS
   */
  private initializeSystems(): void {
    this.renderableSystem = new RenderableSystem()
    this.aiSystem = new AISystem()
    this.keyboardInputSystem = new KeyboardInputSystem()
    this.movementSystem = new MovementSystem()
    this.visibilitySystem = new VisibilitySystem()
  }

  /**
   * Crée ou charge le joueur
   */
  private async createPlayer(): Promise<void> {
    const player = await this.playerStore.createOrLoadPlayer()
    this.entityStore.addPlayer(player)
    this.gameStore.setCenterCameraOnEntity(player)
  }

  /**
   * Charge une carte par son ID
   */
  private async loadMap(mapId: number): Promise<void> {
    console.time(`⏱️  Total loadMap(${mapId})`)
    console.log(`GameScene: Loading map ${mapId}...`)

    // Bloquer updateVisibility pendant le chargement
    this.isLoadingMap = true

    // Charger la carte via le store
    console.time('  ↳ mapStore.loadMapByMapId')
    const gameMap = await this.mapStore.loadMapByMapId(mapId)
    console.timeEnd('  ↳ mapStore.loadMapByMapId')

    const mapData = gameMap.mapData
    const width = gameMap.width
    const height = gameMap.height
    this.currentMapWidth = width
    this.currentMapHeight = height

    // Détruire les anciens sprites de tuiles si ils existent
    console.time('  ↳ clearTileSprites')
    this.clearTileSprites()
    console.timeEnd('  ↳ clearTileSprites')

    // Créer ou réinitialiser le fog graphics
    console.time('  ↳ create fog graphics')
    if (this.fogGraphics) {
      this.fogGraphics.destroy()
    }
    this.fogGraphics = this.add.graphics()
    this.fogGraphics.setDepth(5) // Entre tiles et entités
    console.timeEnd('  ↳ create fog graphics')

    // Créer un sprite pour chaque tuile de la carte
    console.time(`  ↳ create ${width}x${height} tile sprites`)
    for (let row = 0; row < height; row++) {
      this.tileSprites[row] = []

      for (let col = 0; col < width; col++) {
        const rowData = mapData[row]
        if (rowData && rowData[col] !== undefined) {
          const tileIndex = rowData[col]

          if (tileIndex !== undefined) {
            // Récupérer le nom de la tuile depuis le store
            const tile = this.mapStore.getTileByIndex(tileIndex)
            const tileName = tile?.name || 'grass' // Fallback sur grass

            // Créer un sprite pour cette tuile
            const tileKey = `tile_${tileName}`

            // Vérifier si la texture existe, sinon utiliser grass
            const finalTileKey = this.textures.exists(tileKey) ? tileKey : 'tile_grass'

            // Log si une texture est manquante (seulement pour les premières occurrences)
            if (!this.textures.exists(tileKey) && tileKey !== 'tile_grass') {
              console.warn(`⚠️  Texture missing: ${tileKey} (index ${tileIndex}) at (${row},${col}), using grass`)
            }

            const sprite = this.add.sprite(col * TILE_SIZE + HALF_TILE, row * TILE_SIZE + HALF_TILE, finalTileKey)
            sprite.setDepth(0) // Les tuiles au fond
            sprite.setDisplaySize(TILE_SIZE, TILE_SIZE) // Scale to tile size
            this.tileSprites[row]![col] = sprite
          }
        }
      }
    }
    console.timeEnd(`  ↳ create ${width}x${height} tile sprites`)

    // Configurer les limites du monde pour la caméra
    console.time('  ↳ setup camera bounds')
    const worldWidth = width * TILE_SIZE
    const worldHeight = height * TILE_SIZE
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    console.timeEnd('  ↳ setup camera bounds')

    // Débloquer updateVisibility maintenant que le chargement est terminé
    this.isLoadingMap = false

    console.timeEnd(`⏱️  Total loadMap(${mapId})`)
    console.log(`GameScene: Map ${mapId} loaded (${width}x${height})`)
  }

  /**
   * Détruit tous les sprites de tuiles
   */
  private clearTileSprites(): void {
    for (const row of this.tileSprites) {
      for (const sprite of row) {
        if (sprite) {
          sprite.destroy()
        }
      }
    }
    this.tileSprites = []
  }


  /**
   * Crée toutes les entités présentes sur la carte actuelle
   */
  private async createEntitiesForCurrentMap(): Promise<void> {
    const currentMap = this.mapStore.getCurrentMap()
    if (!currentMap) {
      console.warn('GameScene: No current map to load entities')
      return
    }

    const mapId = currentMap.mapMetaData?.id
    if (mapId === undefined) return

    // Charger les entités depuis le store
    // TODO Phase 5: Implémenter le chargement des NPCs depuis les données
    // Pour l'instant, on n'a que le joueur

    console.log(`GameScene: Entities loaded for map ${mapId}`)
  }

  /**
   * Configure la caméra pour suivre le joueur
   */
  private setupCamera(): void {
    const player = this.entityStore.getPlayer()
    if (!player) {
      console.warn('GameScene: No player to follow with camera')
      return
    }

    // Les limites de la caméra ont déjà été définies dans loadMap()

    // Suivre le joueur
    const playerSprite = this.getOrCreateEntitySprite(player)
    if (playerSprite) {
      this.cameras.main.startFollow(playerSprite, true, 0.1, 0.1)
    }

    // Centrer la caméra sur le joueur
    this.centerCameraOnPlayer()
  }

  /**
   * Centre la caméra sur le joueur
   */
  private centerCameraOnPlayer(): void {
    const player = this.entityStore.getPlayer()
    if (!player) return

    const position = player.getPosition()
    this.cameras.main.centerOn(position.col * TILE_SIZE + HALF_TILE, position.row * TILE_SIZE + HALF_TILE)
  }

  /**
   * Configure les contrôles clavier
   */
  private setupKeyboardControls(): void {
    // Écouter les événements clavier globaux
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const player = this.entityStore.getPlayer()
      if (!player) return

      // Prevent browser from capturing arrow keys (stops page scrolling)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'e', 'E'].includes(event.key)) {
        event.preventDefault()
      }

      // Touche "E" pour entrer dans les portails (villes, donjons, etc.)
      if (event.key === 'e' || event.key === 'E') {
        console.log('🔑 Touche E pressée - vérification du portail...')
        this.movementSystem.checkAndActivatePortal(player)
        return
      }

      // Traiter l'input avec le système ECS
      this.keyboardInputSystem.processKeyboardInput(event, [player])
    })
  }

  /**
   * Configure la détection de portails pour les transitions de carte
   */
  private setupPortalDetection(): void {
    this.movementSystem.setOnPortalDetected((portal, entity) => {
      // Ne traiter que les portails pour le joueur
      if (entity.name === 'Avatar') {
        console.log(`🗺️  Transition vers la carte ${portal.destmapid}`)
        this.transitionToMap(portal)
      }
    })
  }

  /**
   * Effectue la transition vers une nouvelle carte via un portail
   */
  private async transitionToMap(portal: any): Promise<void> {
    console.time(`🚪 Total transitionToMap to ${portal.destmapid}`)
    console.log(`🚪 Entering portal to map ${portal.destmapid}`)

    const player = this.entityStore.getPlayer()
    if (!player) return

    // Sauvegarder la position actuelle si on est sur la world map
    // Pour pouvoir y retourner lors de la sortie
    const currentMap = this.mapStore.getCurrentMap()
    if (currentMap && this.mapStore.isCurrentMapWorldMap()) {
      const currentPosition = player.getBehavior('position') as any
      if (currentPosition) {
        const entryPosition = {
          row: currentPosition.position.row,
          col: currentPosition.position.col,
          mapId: currentPosition.position.mapId
        }
        localStorage.setItem('worldmap_entry_position', JSON.stringify(entryPosition))
        console.log(`💾 Position d'entrée sauvegardée: (${entryPosition.row}, ${entryPosition.col})`)
      }
    }

    // Récupérer la position de destination depuis le portail
    const destMapId = parseInt(portal.destmapid, 10)
    const destRow = parseInt(portal.starty, 10) // starty = row
    const destCol = parseInt(portal.startx, 10) // startx = col

    console.log(`📍 Destination: map ${destMapId}, position (${destRow}, ${destCol})`)

    // Mettre à jour la position du joueur
    const positionBehavior = player.getBehavior('position') as any
    if (positionBehavior) {
      positionBehavior.position = new Position(destRow, destCol, destMapId)

      // Sauvegarder immédiatement la nouvelle position
      const savestateBehavior = player.getBehavior('savestate')
      if (savestateBehavior) {
        ;(savestateBehavior as any).storeKeyValue('position', positionBehavior.position)
        console.log(`💾 Position sauvegardée: map ${destMapId}, (${destRow}, ${destCol})`)
      }
    }

    // Charger la nouvelle carte
    await this.loadMap(destMapId)

    // Recréer les entités pour la nouvelle carte
    console.time('  ↳ createEntitiesForCurrentMap')
    await this.createEntitiesForCurrentMap()
    console.timeEnd('  ↳ createEntitiesForCurrentMap')

    // Recentrer la caméra sur le joueur
    console.time('  ↳ centerCameraOnPlayer')
    this.centerCameraOnPlayer()
    console.timeEnd('  ↳ centerCameraOnPlayer')

    // Mettre à jour la visibilité
    console.time('  ↳ updateVisibility')
    this.updateVisibility()
    console.timeEnd('  ↳ updateVisibility')

    console.timeEnd(`🚪 Total transitionToMap to ${portal.destmapid}`)
    console.log(`✅ Transition terminée vers la carte ${destMapId}`)
  }

  /**
   * Met à jour la visibilité du champ de vision (FOV)
   */
  private updateVisibility(): void {
    // Ne pas mettre à jour la visibilité pendant le chargement d'une carte
    if (this.isLoadingMap) {
      return
    }

    if (!this.fogGraphics) {
      console.warn('⚠️  fogGraphics is null!')
      return
    }

    const player = this.entityStore.getPlayer()
    if (!player) {
      console.warn('⚠️  No player found!')
      return
    }

    const playerPosition = player.getPosition()

    // Limiter les logs de debug (seulement toutes les 120 frames = ~2 secondes à 60 FPS)
    const shouldLog = this.debugLogCounter % 120 === 0
    this.debugLogCounter++

    if (shouldLog) {
      console.log(`👁️  FOV Update: Player at (${playerPosition.row}, ${playerPosition.col}) on map ${playerPosition.mapId}`)
      console.log(`📏 Map dimensions: ${this.currentMapWidth}x${this.currentMapHeight}`)
    }

    // Calculer le champ de vision
    const visiblePositions = this.visibilitySystem.calculateFieldOfVision(
      playerPosition,
      this.VISION_RADIUS
    )

    if (shouldLog) {
      console.log(`✨ Visible tiles: ${visiblePositions.size}`)

      // Log quelques positions visibles pour debug
      if (visiblePositions.size > 0) {
        const first5 = Array.from(visiblePositions).slice(0, 5)
        console.log(`   First 5 visible positions: ${first5.join(', ')}`)
      } else {
        console.error('❌ NO VISIBLE TILES! This is the bug!')
      }
    }

    // Redessiner le fog en utilisant Graphics avec batching pour la performance
    this.fogGraphics.clear()

    // Optimisation: utiliser beginPath/closePath pour batching des rectangles
    this.fogGraphics.fillStyle(0x000000, 1.0) // Noir complet

    // Stratégie optimisée: calculer la bounding box autour du joueur
    // et ne dessiner le fog que dans cette zone + le reste de la carte en gros blocs
    const visionRadius = this.VISION_RADIUS
    const minRow = Math.max(0, playerPosition.row - visionRadius - 1)
    const maxRow = Math.min(this.currentMapHeight - 1, playerPosition.row + visionRadius + 1)
    const minCol = Math.max(0, playerPosition.col - visionRadius - 1)
    const maxCol = Math.min(this.currentMapWidth - 1, playerPosition.col + visionRadius + 1)

    if (shouldLog) {
      console.log(`📦 FOV bounds: rows ${minRow}-${maxRow}, cols ${minCol}-${maxCol}`)
    }

    // Zone 1: Top band (tout en noir)
    if (minRow > 0) {
      this.fogGraphics.fillRect(0, 0, this.currentMapWidth * TILE_SIZE, minRow * TILE_SIZE)
    }

    // Zone 2: Bottom band (tout en noir)
    if (maxRow < this.currentMapHeight - 1) {
      this.fogGraphics.fillRect(
        0,
        (maxRow + 1) * TILE_SIZE,
        this.currentMapWidth * TILE_SIZE,
        (this.currentMapHeight - maxRow - 1) * TILE_SIZE
      )
    }

    // Zone 3: Left band (dans la zone centrale)
    if (minCol > 0) {
      this.fogGraphics.fillRect(
        0,
        minRow * TILE_SIZE,
        minCol * TILE_SIZE,
        (maxRow - minRow + 1) * TILE_SIZE
      )
    }

    // Zone 4: Right band (dans la zone centrale)
    if (maxCol < this.currentMapWidth - 1) {
      this.fogGraphics.fillRect(
        (maxCol + 1) * TILE_SIZE,
        minRow * TILE_SIZE,
        (this.currentMapWidth - maxCol - 1) * TILE_SIZE,
        (maxRow - minRow + 1) * TILE_SIZE
      )
    }

    // Zone 5: Zone centrale autour du joueur - dessiner tile par tile uniquement ici
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const posKey = `${row},${col}`
        const isVisible = visiblePositions.has(posKey)

        if (!isVisible) {
          this.fogGraphics.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
      }
    }
  }

  /**
   * Récupère ou crée un sprite pour une entité
   */
  private getOrCreateEntitySprite(entity: Entity): Phaser.GameObjects.Sprite | null {
    // Vérifier si le sprite existe déjà
    if (this.entitySprites.has(entity.id)) {
      return this.entitySprites.get(entity.id)!
    }

    // Créer un nouveau sprite
    const position = entity.getPosition()
    const tile = entity.getEntityTile()

    if (!tile) {
      console.warn(`GameScene: Entity ${entity.name} has no tile`)
      return null
    }

    // Récupérer le nom de la tuile
    const tileName = tile.name || 'avatar'
    const tileKey = `tile_${tileName}`

    // Vérifier si la texture existe, sinon utiliser avatar par défaut
    const finalTileKey = this.textures.exists(tileKey) ? tileKey : 'tile_avatar'

    // Pour l'avatar (spritesheet), utiliser la frame 0
    // Pour les autres tiles (images simples), pas de frame
    let sprite: Phaser.GameObjects.Sprite
    if (finalTileKey === 'tile_avatar') {
      sprite = this.add.sprite(position.col * TILE_SIZE + HALF_TILE, position.row * TILE_SIZE + HALF_TILE, finalTileKey, 0)
    } else {
      sprite = this.add.sprite(position.col * TILE_SIZE + HALF_TILE, position.row * TILE_SIZE + HALF_TILE, finalTileKey)
    }

    sprite.setDepth(10) // Les entités au-dessus des tuiles

    // Scale sprite to match tile size
    // Original tiles are 32x32 per frame, scale to TILE_SIZE
    sprite.setDisplaySize(TILE_SIZE, TILE_SIZE)

    // Center the sprite and use pixel-perfect scaling
    sprite.setOrigin(0.5, 0.5)
    const texture = this.textures.get(finalTileKey)
    if (texture) {
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST) // Pixel-perfect scaling
    }

    // Sauvegarder le sprite
    this.entitySprites.set(entity.id, sprite)

    return sprite
  }

  /**
   * Met à jour un sprite d'entité
   */
  private updateEntitySprite(entity: Entity): void {
    const sprite = this.entitySprites.get(entity.id)
    if (!sprite) return

    const position = entity.getPosition()

    // Mettre à jour la position du sprite
    sprite.setPosition(position.col * TILE_SIZE + HALF_TILE, position.row * TILE_SIZE + HALF_TILE)

    // Mettre à jour la texture si la tuile de l'entité a changé
    const tile = entity.getEntityTile()
    if (tile) {
      const tileName = tile.name || 'avatar'
      const tileKey = `tile_${tileName}`
      const finalTileKey = this.textures.exists(tileKey) ? tileKey : 'tile_avatar'

      if (sprite.texture.key !== finalTileKey) {
        // Pour l'avatar (spritesheet), utiliser la frame 0
        if (finalTileKey === 'tile_avatar') {
          sprite.setTexture(finalTileKey, 0)
        } else {
          sprite.setTexture(finalTileKey)
        }
      }
    }
  }

  /**
   * Détruit un sprite d'entité
   */
  private destroyEntitySprite(entityId: string): void {
    const sprite = this.entitySprites.get(entityId)
    if (sprite) {
      sprite.destroy()
      this.entitySprites.delete(entityId)
    }
  }

  /**
   * Boucle de mise à jour du jeu
   */
  update(time: number, delta: number): void {
    // Récupérer toutes les entités à mettre à jour
    const player = this.entityStore.getPlayer()
    if (!player) return

    const currentMap = this.mapStore.getCurrentMap()
    if (!currentMap) return

    const mapId = currentMap.mapMetaData?.id
    if (mapId === undefined) return

    const entities = this.entityStore.getEntitiesForMapId(mapId)
    const allEntities = player ? [player, ...entities] : entities

    // Mettre à jour les systèmes ECS
    // Note: Keyboard input is handled via event listeners in setupKeyboardControls()

    // Mettre à jour l'IA
    this.aiSystem.processAiBehavior(allEntities)

    // Mettre à jour les mouvements
    this.movementSystem.processMovementsBehavior(allEntities)

    // Mettre à jour le rendu (tick d'animation)
    this.renderableSystem.processTick(allEntities)

    // Synchroniser les sprites Phaser avec les positions des entités
    this.syncSpritesWithEntities(allEntities)

    // Mettre à jour la visibilité (FOV) après le mouvement
    this.updateVisibility()
  }

  /**
   * Synchronise les sprites Phaser avec les entités
   */
  private syncSpritesWithEntities(entities: Entity[]): void {
    // Créer ou mettre à jour les sprites pour toutes les entités
    for (const entity of entities) {
      if (entity.hasTile()) {
        const sprite = this.getOrCreateEntitySprite(entity)
        if (sprite) {
          this.updateEntitySprite(entity)
        }
      }
    }

    // Supprimer les sprites des entités qui n'existent plus
    const entityIds = new Set(entities.map((e) => e.id))
    for (const [spriteId] of this.entitySprites) {
      if (!entityIds.has(spriteId)) {
        this.destroyEntitySprite(spriteId)
      }
    }
  }

  /**
   * Nettoie la scène
   */
  shutdown(): void {
    // Détruire tous les sprites de tuiles
    this.clearTileSprites()

    // Détruire le fog graphics
    if (this.fogGraphics) {
      this.fogGraphics.destroy()
      this.fogGraphics = null
    }

    // Détruire tous les sprites d'entités
    for (const [entityId] of this.entitySprites) {
      this.destroyEntitySprite(entityId)
    }

    this.entitySprites.clear()
  }
}
