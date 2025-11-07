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

    // BENCHMARK: Mesurer le temps de la boucle
    const beforeLoop = performance.now()
    let aiEntityCount = 0
    let tickTimeTotal = 0
    let getBehaviorTimeTotal = 0

    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('aimovement') && entity.hasBehavior('movable')) {
        aiEntityCount++

        const beforeGetBehavior = performance.now()
        const aiMovementBehavior = entity.getBehavior('aimovement') as AiMovementBehavior
        const afterGetBehavior = performance.now()
        getBehaviorTimeTotal += afterGetBehavior - beforeGetBehavior

        const beforeTick = performance.now()
        aiMovementBehavior.tick(now)
        const afterTick = performance.now()
        tickTimeTotal += afterTick - beforeTick
      }
    })

    const loopTime = performance.now() - beforeLoop
    if (loopTime > 50) {  // Log seulement si > 50ms
      console.log(`🔍 AISystem: ${aiEntityCount} entities, loop ${loopTime.toFixed(2)}ms, getBehavior ${getBehaviorTimeTotal.toFixed(2)}ms, tick total ${tickTimeTotal.toFixed(2)}ms`)
    }
  }
}
