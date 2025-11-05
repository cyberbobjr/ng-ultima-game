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

  constructor() {
    super({ key: 'LoadingScene' })
  }

  preload(): void {
    // Créer les éléments visuels de chargement
    this.createLoadingUI()

    // Écouter les événements de chargement
    this.load.on('progress', this.onLoadProgress, this)
    this.load.on('complete', this.onLoadComplete, this)

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
    // Note: Les tilesets et autres assets seront chargés via les stores
    // Pour l'instant, on simule un chargement minimal
    // Dans les phases futures, nous chargerons les vrais assets depuis les fichiers JSON

    // Charger un tileset de test (sera remplacé par les vrais tilesets)
    // this.load.image('tiles', '/assets/tiles.png')

    // Pour l'instant, créer des tuiles de test avec des formes géométriques
    this.createTestTiles()
  }

  /**
   * Crée des tuiles de test pour le développement
   */
  private createTestTiles(): void {
    // Créer un canvas pour générer des tuiles de test
    const tileSize = 16
    const tilesPerRow = 16
    const canvas = document.createElement('canvas')
    canvas.width = tileSize * tilesPerRow
    canvas.height = tileSize * tilesPerRow
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Générer quelques tuiles de test avec différentes couleurs
      const colors = [
        '#1a472a', // Herbe (vert foncé)
        '#2a7a3a', // Herbe (vert clair)
        '#4a4a4a', // Pierre
        '#8b7355', // Terre
        '#4a7ba7', // Eau
        '#ffffff', // Blanc (avatar)
        '#ff0000', // Rouge
        '#ffaa00'  // Orange
      ]

      for (let i = 0; i < colors.length && i < tilesPerRow * tilesPerRow; i++) {
        const x = (i % tilesPerRow) * tileSize
        const y = Math.floor(i / tilesPerRow) * tileSize

        const color = colors[i]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x, y, tileSize, tileSize)
        }

        // Ajouter une bordure pour mieux voir les tuiles
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, tileSize, tileSize)
      }

      // Convertir le canvas en texture Phaser
      this.textures.addCanvas('tileset', canvas)
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
   * Appelé quand le chargement est terminé
   */
  private async onLoadComplete(): Promise<void> {
    this.loadingText.setText('Initializing game...')

    try {
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
