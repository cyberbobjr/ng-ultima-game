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
import type { PositionBehavior } from '@/game/ecs/behaviors/PositionBehavior'

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
  private tilemap!: Phaser.Tilemaps.Tilemap
  private tileset!: Phaser.Tilemaps.Tileset
  private groundLayer!: Phaser.Tilemaps.TilemapLayer

  // Sprites pour les entités
  private entitySprites: Map<string, Phaser.GameObjects.Sprite> = new Map()

  // ECS Systems
  private renderableSystem!: RenderableSystem
  private aiSystem!: AISystem
  private keyboardInputSystem!: KeyboardInputSystem
  private movementSystem!: MovementSystem

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
    console.log(`GameScene: Loading map ${mapId}...`)

    // Charger la carte via le store
    const gameMap = await this.mapStore.loadMapByMapId(mapId)

    // Créer le tilemap Phaser
    const mapData = gameMap.mapData
    const width = gameMap.width
    const height = gameMap.height

    // Créer un tilemap vide
    this.tilemap = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: width,
      height: height
    })

    // Ajouter le tileset
    // Note: Le nom 'tileset' correspond à la texture créée dans LoadingScene
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset', 16, 16, 0, 0)!

    // Créer la couche de tuiles
    const layer = this.tilemap.createBlankLayer('ground', this.tileset, 0, 0, width, height)

    if (layer) {
      this.groundLayer = layer

      // Remplir la couche avec les données de la carte
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const rowData = mapData[row]
          if (rowData && rowData[col] !== undefined) {
            const tileIndex = rowData[col]
            if (tileIndex !== undefined) {
              // Phaser utilise des indices 1-based pour les tuiles, 0 = pas de tuile
              // Nos données sont 0-based, donc on ajoute 1
              this.groundLayer.putTileAt(tileIndex > 0 ? tileIndex : 1, col, row)
            }
          }
        }
      }
    }

    console.log(`GameScene: Map ${mapId} loaded (${width}x${height})`)
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

    // Définir les limites de la caméra sur la carte
    const currentMap = this.mapStore.getCurrentMap()
    if (currentMap && this.tilemap) {
      const mapWidth = currentMap.width * 16
      const mapHeight = currentMap.height * 16
      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight)
    }

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
    this.cameras.main.centerOn(position.col * 16 + 8, position.row * 16 + 8)
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

    // Pour l'instant, utiliser un carré blanc pour le joueur
    // TODO Phase 5: Utiliser les vraies tuiles depuis le tileset
    const sprite = this.add.sprite(position.col * 16 + 8, position.row * 16 + 8, 'tileset')

    // Définir le frame (tuile) à afficher
    // Pour le test, utiliser la tuile 5 (blanc) pour le joueur
    sprite.setFrame(5)

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
    sprite.setPosition(position.col * 16 + 8, position.row * 16 + 8)

    // TODO Phase 5: Mettre à jour le frame selon la tuile de l'entité
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
    // TODO Phase 5: Passer les inputs clavier au KeyboardInputSystem
    // this.keyboardInputSystem.processInput(allEntities)

    // Mettre à jour l'IA
    this.aiSystem.processAiBehavior(allEntities)

    // Mettre à jour les mouvements
    this.movementSystem.processMovementsBehavior(allEntities)

    // Mettre à jour le rendu (tick d'animation)
    this.renderableSystem.processTick(allEntities)

    // Synchroniser les sprites Phaser avec les positions des entités
    this.syncSpritesWithEntities(allEntities)
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
    // Détruire tous les sprites
    for (const [entityId] of this.entitySprites) {
      this.destroyEntitySprite(entityId)
    }

    this.entitySprites.clear()
  }
}
