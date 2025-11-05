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

  constructor(actor: Entity, movementType: number) {
    this.actor = actor
    this.movementType = movementType
  }

  tick(performanceNow: number): any {
    if (performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
      if (
        this.actor.hasBehavior('movable') &&
        this.actor.hasBehavior('position') &&
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
    const movementBehavior = this.actor.getBehavior('movable') as MovableBehavior
    const positionBehavior = this.actor.getBehavior('position') as PositionBehavior

    if (movementBehavior && positionBehavior) {
      movementBehavior.vector = new Position(
        this._random(-1, 1),
        this._random(-1, 1),
        positionBehavior.position.mapId
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
