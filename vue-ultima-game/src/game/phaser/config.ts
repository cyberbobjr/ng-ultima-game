import Phaser from 'phaser'
import { TestScene } from './scenes/TestScene'

/**
 * Configuration principale de Phaser pour le jeu Ultima
 */
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Utilise WebGL si disponible, sinon Canvas
  width: 320, // 10 tiles * 32px
  height: 320, // 10 tiles * 32px
  parent: 'phaser-game', // ID de l'élément HTML parent
  backgroundColor: '#2d2d2d',

  // Scènes du jeu (pour le moment juste la scène de test)
  scene: [TestScene],

  // Configuration de la physique (arcade par défaut pour les jeux 2D)
  physics: {
    default: 'arcade',
    arcade: {
      debug: false, // Mettre à true pour voir les hitboxes
      gravity: { x: 0, y: 0 } // Pas de gravité pour un jeu RPG top-down
    }
  },

  // Configuration du scaling et de l'affichage
  scale: {
    mode: Phaser.Scale.FIT, // Adapte le jeu à la taille de l'écran
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centre le jeu
    width: 320,
    height: 320
  },

  // Configuration du rendu
  render: {
    pixelArt: true, // Important pour les jeux rétro/pixel art
    antialias: false, // Désactivé pour le pixel art
    roundPixels: true // Arrondit les positions des pixels
  },

  // FPS
  fps: {
    target: 60,
    forceSetTimeOut: false
  }
}
