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
    // Appeler performance.now() UNE SEULE FOIS au lieu de N fois
    const now = performance.now()
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('aimovement') && entity.hasBehavior('movable')) {
        const aiMovementBehavior = entity.getBehavior('aimovement') as AiMovementBehavior
        aiMovementBehavior.tick(now)
      }
    })
  }
}
