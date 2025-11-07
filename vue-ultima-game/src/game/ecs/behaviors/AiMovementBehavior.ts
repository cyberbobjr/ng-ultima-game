import _ from 'lodash'
import type { IBehavior } from '../../models/interfaces/IBehavior'
import type { Entity } from '../entities/Entity'
import type { MovableBehavior } from './MovableBehavior'
import type { PositionBehavior } from './PositionBehavior'
import { Position } from '../../models/Position'

const TIMER_INTERVAL_SECONDS = 2000

/**
 * Types de mouvement AI
 */
export enum MovementType {
  Fixed = 0, // Ne bouge pas
  Wander = 1, // Déambule aléatoirement
  Follow = 2, // Suit une cible
  Attack = 3 // Attaque une cible
}

/**
 * AiMovementBehavior - Gère le mouvement automatique des NPCs
 */
export class AiMovementBehavior implements IBehavior {
  name = 'aimovement'
  movementType: MovementType = MovementType.Fixed
  actor: Entity
  lastPerformanceNow: number = 0
  private _movementTypeBackup?: MovementType
  private _movableBehavior: MovableBehavior | null = null  // Cache
  private _positionBehavior: PositionBehavior | null = null  // Cache

  constructor(actor: Entity, movementType: number) {
    this.actor = actor
    this.movementType = movementType

    // OPTIMISATION: Cacher les behaviors une fois au lieu de les récupérer à chaque tick
    this._movableBehavior = this.actor.getBehavior('movable') as MovableBehavior || null
    this._positionBehavior = this.actor.getBehavior('position') as PositionBehavior || null
  }

  tick(performanceNow: number): any {
    const t0 = performance.now()
    const shouldUpdate = performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS
    const t1 = performance.now()

    if (shouldUpdate) {
      const t2 = performance.now()
      const shouldWander = this._movableBehavior &&
        this._positionBehavior &&
        this.movementType === MovementType.Wander
      const t3 = performance.now()

      if (shouldWander) {
        const t4 = performance.now()
        this._randomMove()
        const t5 = performance.now()

        if (t5 - t4 > 5 && (window as any).__debugMovement) {
          console.log(`🐛 AiMovementBehavior._randomMove() took ${(t5 - t4).toFixed(2)}ms`)
        }
      }

      const t6 = performance.now()
      this.lastPerformanceNow = performanceNow
      const t7 = performance.now()

      const totalTime = t7 - t0
      if (totalTime > 5 && (window as any).__debugMovement) {
        console.log(`🐛 AiMovementBehavior.tick() breakdown:
  - shouldUpdate check: ${(t1 - t0).toFixed(2)}ms
  - shouldWander check: ${(t3 - t2).toFixed(2)}ms
  - assignment: ${(t7 - t6).toFixed(2)}ms
  - TOTAL: ${totalTime.toFixed(2)}ms`)
      }
    }
  }

  /**
   * Effectue un mouvement aléatoire
   */
  private _randomMove(): void {
    if (this._movableBehavior && this._positionBehavior) {
      this._movableBehavior.vector = new Position(
        this._random(-1, 1),
        this._random(-1, 1),
        this._positionBehavior.position.mapId
      )
    }
  }

  /**
   * Génère un nombre aléatoire entre min et max (inclus)
   */
  private _random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  /**
   * Arrête temporairement le mouvement AI
   */
  stopAiMovement(): void {
    this._movementTypeBackup = _.clone(this.movementType)
    this.movementType = MovementType.Fixed
  }

  /**
   * Reprend le mouvement AI précédent
   */
  resumeAiMovement(): void {
    if (this._movementTypeBackup !== undefined) {
      this.movementType = this._movementTypeBackup
    }
  }
}
