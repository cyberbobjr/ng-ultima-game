import Phaser from 'phaser'

/**
 * TestScene - Scène de test pour vérifier que Phaser fonctionne correctement
 */
export class TestScene extends Phaser.Scene {
  private logo?: Phaser.GameObjects.Image
  private moveSpeed: number = 100

  constructor() {
    super({ key: 'TestScene' })
  }

  preload() {
    // Pour le moment, on va créer une texture simple
    this.textures.generate('tile', {
      data: [
        '00000000',
        '00111100',
        '01122110',
        '01233210',
        '01233210',
        '01122110',
        '00111100',
        '00000000'
      ],
      pixelWidth: 4,
      pixelHeight: 4
    })
  }

  create() {
    // Fond de couleur
    this.cameras.main.setBackgroundColor('#2d2d2d')

    // Créer un titre
    const title = this.add.text(160, 50, 'Ultima Game - Vue.js + Phaser', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    })
    title.setOrigin(0.5)

    // Créer une grille de tuiles de test
    this.createTileGrid()

    // Message d'instructions
    const instructions = this.add.text(
      160,
      280,
      'Phase 1 - Projet initialisé avec succès!\nCeci est une scène de test Phaser.',
      {
        fontSize: '12px',
        color: '#00ff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    )
    instructions.setOrigin(0.5)

    console.log('TestScene créée avec succès!')
  }

  update(time: number, delta: number) {
    // Logique de mise à jour (pour le moment vide)
  }

  /**
   * Crée une grille de tuiles pour tester le rendu
   */
  private createTileGrid() {
    const tileSize = 32
    const cols = 10
    const rows = 5
    const startX = 10
    const startY = 100

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * tileSize
        const y = startY + row * tileSize

        // Créer une tuile avec une couleur qui varie
        const graphics = this.add.graphics()

        // Couleur de la tuile (alternance)
        const isEven = (row + col) % 2 === 0
        graphics.fillStyle(isEven ? 0x228b22 : 0x32cd32, 1)
        graphics.fillRect(x, y, tileSize - 2, tileSize - 2)

        // Bordure
        graphics.lineStyle(1, 0x000000, 0.5)
        graphics.strokeRect(x, y, tileSize - 2, tileSize - 2)
      }
    }
  }
}
