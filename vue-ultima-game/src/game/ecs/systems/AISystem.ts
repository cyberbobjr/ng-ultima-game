import type { Entity } from '../entities/Entity'
import type { AiMovementBehavior } from '../behaviors/AiMovementBehavior'

/**
 * AISystem - Traite le comportement AI de toutes les entités
 * Gère les mouvements automatiques des NPCs
 */
export class AISystem {
  /**
   * Traite le comportement AI de toutes les entités
   * @param entities Liste des entités à traiter
   */
  processAiBehavior(entities: Entity[]): void {
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('aimovement') && entity.hasBehavior('movable')) {
        this._processAiEntityMovements(entity)
      }
    })
  }

  /**
   * Traite le mouvement AI d'une entité spécifique
   */
  private _processAiEntityMovements(entity: Entity): void {
    const aiMovementBehavior = entity.getBehavior('aimovement') as AiMovementBehavior
    aiMovementBehavior.tick(performance.now())
  }
}
