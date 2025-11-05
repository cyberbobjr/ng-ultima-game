import Phaser from 'phaser'
import { useMapStore } from '@/stores/useMapStore'
import { useGameStore } from '@/stores/useGameStore'
import { useEntityStore } from '@/stores/useEntityStore'

/**
 * LoadingScene - Scène de chargement des assets du jeu
 * Charge toutes les ressources nécessaires avant de lancer le jeu
 */
export class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text
  private progressBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics
  private tilesData: any = null

  constructor() {
    super({ key: 'LoadingScene' })
  }

  preload(): void {
    // Créer les éléments visuels de chargement
    this.createLoadingUI()

    // Écouter les événements de chargement
    this.load.on('progress', this.onLoadProgress, this)
    this.load.on('complete', this.onLoadComplete, this)
    this.load.on('loaderror', this.onLoadError, this)

    // Charger les assets du jeu
    this.loadGameAssets()
  }

  /**
   * Crée l'interface de chargement
   */
  private createLoadingUI(): void {
    const { width, height } = this.cameras.main

    // Texte de chargement
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Ultima...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    this.loadingText.setOrigin(0.5)

    // Boîte de la barre de progression
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x222222, 0.8)
    this.progressBox.fillRect(width / 2 - 160, height / 2, 320, 30)

    // Barre de progression
    this.progressBar = this.add.graphics()
  }

  /**
   * Charge tous les assets du jeu
   */
  private loadGameAssets(): void {
    // Charger les fichiers JSON de configuration
    this.load.json('tiles', '/tiles.json')
    this.load.json('tiles_rules', '/tiles_rules.json')
    this.load.json('maps', '/maps.json')

    // Charger toutes les tuiles individuelles
    // Les noms de tuiles sont connus à l'avance
    const tileNames = [
      'avatar', 'sea', 'water', 'shallows', 'swamp', 'grass', 'brush', 'forest',
      'hills', 'mountains', 'dungeon', 'city', 'castle', 'town', 'lcb_west',
      'lcb_entrance', 'lcb_east', 'ship', 'horse', 'dungeon_floor', 'bridge',
      'balloon', 'bridge_pieces', 'shrine', 'ruins', 'shipwheel', 'rocks',
      'corpse', 'stone_wall', 'locked_door', 'door', 'chest', 'ankh', 'brick_floor',
      'wood_floor', 'brick_wall', 'moongate', 'up_ladder', 'down_ladder',
      'column', 'solid', 'secret_door', 'altar', 'campfire', 'lava', 'miss_flash',
      'magic_flash', 'hit_flash', 'poison_field', 'energy_field', 'fire_field',
      'sleep_field', 'whirlpool', 'storm', 'space', 'black'
    ]

    // Charger les tuiles de base
    for (const tileName of tileNames) {
      this.load.image(`tile_${tileName}`, `/tiles/tile_${tileName}.png`)
    }

    // Charger aussi les lettres A-Z pour les panneaux
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i)
      this.load.image(`tile_${letter}`, `/tiles/tile_${letter}.png`)
    }

    // Charger les NPCs et monstres
    const npcTiles = [
      'guard', 'villager', 'bard', 'bard_singing', 'jester', 'beggar', 'child',
      'bull', 'lord_british', 'shepherd', 'fighter', 'mage', 'ranger', 'rogue',
      'paladin', 'druid', 'tinker',
      // Monstres
      'orc', 'skeleton', 'troll', 'rat', 'bat', 'spider', 'ghost',
      'slime', 'dragon', 'balron', 'cyclops', 'daemon', 'ettin', 'gazer',
      'gremlin', 'headless', 'hydra', 'insect_swarm', 'liche', 'mimic',
      'nixie', 'phantom', 'python', 'reaper', 'sea_horse', 'sea_serpent',
      'wisp', 'zorn', 'lava_lizard', 'giant_squid', 'evil_mage'
    ]

    for (const npcName of npcTiles) {
      this.load.image(`tile_${npcName}`, `/tiles/tile_${npcName}.png`)
    }
  }

  /**
   * Appelé pendant le chargement
   */
  private onLoadProgress(progress: number): void {
    const { width, height } = this.cameras.main

    // Mettre à jour la barre de progression
    this.progressBar.clear()
    this.progressBar.fillStyle(0xffffff, 1)
    this.progressBar.fillRect(width / 2 - 150, height / 2 + 5, 300 * progress, 20)

    // Mettre à jour le texte
    this.loadingText.setText(`Loading Ultima... ${Math.round(progress * 100)}%`)
  }

  /**
   * Gère les erreurs de chargement
   */
  private onLoadError(file: Phaser.Loader.File): void {
    console.warn(`Failed to load: ${file.key}`, file.src)
    // Continue loading even if some assets fail
  }

  /**
   * Appelé quand le chargement est terminé
   */
  private async onLoadComplete(): Promise<void> {
    this.loadingText.setText('Initializing game...')

    try {
      // Récupérer les données des tuiles
      this.tilesData = this.cache.json.get('tiles')

      // Initialiser les stores
      await this.initializeStores()

      // Petit délai pour voir le message
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Transition vers la scène de jeu
      this.scene.start('GameScene')
    } catch (error) {
      console.error('Error initializing game:', error)
      this.loadingText.setText('Error loading game!')
      this.loadingText.setColor('#ff0000')
    }
  }

  /**
   * Initialise tous les stores Pinia nécessaires
   */
  private async initializeStores(): Promise<void> {
    const mapStore = useMapStore()
    const gameStore = useGameStore()
    const entityStore = useEntityStore()

    // Charger les tuiles
    this.loadingText.setText('Loading tiles...')
    await mapStore.loadTiles()

    // Charger toutes les cartes (métadonnées)
    this.loadingText.setText('Loading maps...')
    await mapStore.loadAllMaps()

    // Charger la configuration du jeu
    this.loadingText.setText('Loading configuration...')
    await gameStore.loadConfig()

    // Initialiser le store des entités
    this.loadingText.setText('Loading entities...')
    await entityStore.initialize()

    this.loadingText.setText('Ready!')
  }
}
