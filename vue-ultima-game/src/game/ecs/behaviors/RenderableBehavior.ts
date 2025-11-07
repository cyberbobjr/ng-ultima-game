import _ from 'lodash'
import { toRaw } from 'vue'
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
  private _isAnimated: boolean = false  // Cache pour éviter _.has() à chaque frame
  private _maxFrames: number = 0  // Cache pour éviter parseInt() à chaque animation

  constructor(tile: ITile) {
    // CRITIQUE: Utiliser toRaw() pour désactiver la réactivité Vue
    // Sans ça, this.tile.currentFrame++ déclenche les watchers Vue (15ms par entity!)
    this.tile = toRaw(tile)
    this.tile.currentFrame = 0
    // Cacher si la tile est animée une seule fois au lieu de vérifier à chaque frame
    this._isAnimated = !!(tile.frames && (tile as any).animation === 'frame')
    // Cacher le nombre de frames pour éviter parseInt() à chaque animation
    this._maxFrames = tile.frames ? parseInt(tile.frames, 10) : 0
  }

  tick(performanceNow: number): any {
    const t0 = performance.now()
    const shouldUpdate = performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS
    const t1 = performance.now()

    if (shouldUpdate) {
      const t2 = performance.now()
      const isAnimated = this._isAnimatedTile()
      const t3 = performance.now()

      if (isAnimated) {
        const t4 = performance.now()
        this._processNextFrame()
        const t5 = performance.now()

        // Log si > 5ms
        if (t5 - t4 > 5 && (window as any).__debugMovement) {
          console.log(`🐛 RenderableBehavior._processNextFrame() took ${(t5 - t4).toFixed(2)}ms`)
        }
      }

      const t6 = performance.now()
      this.lastPerformanceNow = performanceNow
      const t7 = performance.now()

      const totalTime = t7 - t0
      if (totalTime > 5 && (window as any).__debugMovement) {
        console.log(`🐛 RenderableBehavior.tick() breakdown:
  - shouldUpdate check: ${(t1 - t0).toFixed(2)}ms
  - isAnimated check: ${(t3 - t2).toFixed(2)}ms
  - assignment: ${(t7 - t6).toFixed(2)}ms
  - TOTAL: ${totalTime.toFixed(2)}ms`)
      }
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
    return this._isAnimated  // Utilise le cache au lieu de _.has()
  }

  /**
   * Passe à la frame suivante de l'animation
   */
  private _processNextFrame(): void {
    if (this._maxFrames > 0) {
      if (this.tile.currentFrame < this._maxFrames - 1) {
        this.tile.currentFrame++
      } else {
        this.tile.currentFrame = 0
      }
    }
  }
}
