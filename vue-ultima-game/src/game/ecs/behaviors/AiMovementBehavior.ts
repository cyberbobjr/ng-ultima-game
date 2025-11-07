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
    if (performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
      if (
        this._movableBehavior &&
        this._positionBehavior &&
        this.movementType === MovementType.Wander
      ) {
        this._randomMove()
      }
      this.lastPerformanceNow = performanceNow
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
