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
    // NOTE: Si vous voyez des erreurs de chargement, lancez le serveur dev avec:
    // npm run dev

    // Charger les fichiers JSON de configuration
    this.load.json('tiles', '/tiles.json')
    this.load.json('tiles_rules', '/tiles_rules.json')
    this.load.json('maps', '/maps.json')

    // Charger seulement les tuiles essentielles
    const essentialTiles = [
      'avatar', 'grass', 'water', 'sea', 'mountains', 'forest',
      'city', 'castle', 'dungeon', 'door', 'bridge'
    ]

    for (const tileName of essentialTiles) {
      this.load.image(`tile_${tileName}`, `/tiles/tile_${tileName}.png`)
    }

    // Si les assets ne se chargent pas, on utilisera des tuiles générées
    // Cela sera fait dans onLoadComplete si besoin
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
      // Vérifier si les textures PNG ont été chargées
      const hasRealAssets = this.textures.exists('tile_grass')

      if (!hasRealAssets) {
        // Les assets n'ont pas été chargés (serveur dev non lancé)
        console.warn('⚠️  Real assets not loaded. Creating fallback tiles...')
        console.warn('💡 Tip: Start the dev server with "npm run dev" to load real assets')
        this.createFallbackTiles()
      }

      // Récupérer les données des tuiles si disponibles
      const tilesCache = this.cache.json.get('tiles')
      if (tilesCache && typeof tilesCache === 'object' && !Array.isArray(tilesCache)) {
        this.tilesData = tilesCache
      } else {
        console.warn('Tiles JSON not loaded, using defaults')
        this.tilesData = null
      }

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

      if (error instanceof Error) {
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  }

  /**
   * Crée des tuiles de fallback si les vrais assets ne sont pas disponibles
   */
  private createFallbackTiles(): void {
    const tileSize = 16
    const canvas = document.createElement('canvas')
    canvas.width = tileSize
    canvas.height = tileSize
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Définir les couleurs pour chaque type de tuile
    const tileColors: { [key: string]: string } = {
      grass: '#2a7a3a',
      water: '#4a7ba7',
      sea: '#2a5a8a',
      mountains: '#8a7a6a',
      forest: '#1a5a2a',
      city: '#aaaaaa',
      castle: '#8a8a8a',
      dungeon: '#4a4a4a',
      door: '#8b7355',
      bridge: '#6a5a4a',
      avatar: '#ffffff'
    }

    // Créer une texture pour chaque tuile
    for (const [tileName, color] of Object.entries(tileColors)) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, tileSize, tileSize)

      // Ajouter une bordure pour mieux voir les tuiles
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, tileSize, tileSize)

      // Convertir le canvas en texture Phaser
      this.textures.addCanvas(`tile_${tileName}`, canvas)
    }

    console.log('✅ Fallback tiles created successfully')
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
