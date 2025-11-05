import Phaser from 'phaser'
import { LoadingScene } from './scenes/LoadingScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'

/**
 * Configuration principale de Phaser pour le jeu Ultima
 */
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Utilise WebGL si disponible, sinon Canvas
  width: 800, // Larger default width
  height: 600, // Larger default height
  parent: 'phaser-game', // ID de l'élément HTML parent
  backgroundColor: '#000000',

  // Scènes du jeu (LoadingScene démarre automatiquement)
  scene: [LoadingScene, GameScene, UIScene],

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
    mode: Phaser.Scale.FIT, // Adapte le jeu à la taille du conteneur
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centre le jeu
    width: 800,
    height: 600,
    parent: 'phaser-game'
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
