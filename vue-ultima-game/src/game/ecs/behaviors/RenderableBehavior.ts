import _ from 'lodash'
import type { IBehavior } from '../../models/interfaces/IBehavior'
import type { ITile } from '../../models/interfaces/ITile'

const TIMER_INTERVAL_SECONDS = 1000

/**
 * RenderableBehavior - Gère le rendu visuel d'une entité
 * Supporte les tuiles animées
 */
export class RenderableBehavior implements IBehavior {
  name = 'renderable'
  tile: ITile
  lastPerformanceNow: number = 0

  constructor(tile: ITile) {
    this.tile = tile
    this.tile.currentFrame = 0
  }

  tick(performanceNow: number): any {
    if (performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
      if (this._isAnimatedTile()) {
        this._processNextFrame()
      }
      this.lastPerformanceNow = performanceNow
    }
    return null
  }

  /**
   * Récupère la tuile de rendu
   * @returns Tuile de l'entité
   */
  getTile(): ITile {
    return this.tile
  }

  /**
   * Vérifie si la tuile est animée
   * @returns true si la tuile a plusieurs frames
   */
  private _isAnimatedTile(): boolean {
    return (
      _.has(this.tile, 'frames') &&
      _.has(this.tile, 'animation') &&
      (this.tile as any).animation === 'frame'
    )
  }

  /**
   * Passe à la frame suivante de l'animation
   */
  private _processNextFrame(): void {
    if (this.tile.frames) {
      if (this.tile.currentFrame < parseInt(this.tile.frames, 10) - 1) {
        this.tile.currentFrame++
      } else {
        this.tile.currentFrame = 0
      }
    }
  }
}
