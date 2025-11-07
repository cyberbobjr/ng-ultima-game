import type { Entity } from '../entities/Entity'
import type { RenderableBehavior } from '../behaviors/RenderableBehavior'

/**
 * RenderableSystem - Traite les animations de toutes les entités avec un RenderableBehavior
 * Note: Avec Phaser, ce système pourrait être simplifié car Phaser gère les animations
 */
export class RenderableSystem {
  /**
   * Traite le tick d'animation de toutes les entités
   * @param entities Liste des entités à traiter
   */
  processTick(entities: Entity[]): void {
    // Appeler performance.now() UNE SEULE FOIS au lieu de N fois
    const now = performance.now()

    // BENCHMARK: Mesurer le temps de la boucle
    const beforeLoop = performance.now()
    let renderableEntityCount = 0
    let tickTimeTotal = 0

    let getBehaviorTimeTotal = 0

    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('renderable')) {
        renderableEntityCount++

        const beforeGetBehavior = performance.now()
        const renderableBehavior = entity.getBehavior('renderable') as RenderableBehavior
        const afterGetBehavior = performance.now()
        getBehaviorTimeTotal += afterGetBehavior - beforeGetBehavior

        const beforeTick = performance.now()
        renderableBehavior.tick(now)
        const afterTick = performance.now()
        tickTimeTotal += afterTick - beforeTick
      }
    })

    const loopTime = performance.now() - beforeLoop
    if (loopTime > 50) {  // Log seulement si > 50ms
      console.log(`🔍 RenderableSystem: ${renderableEntityCount} entities, loop ${loopTime.toFixed(2)}ms, getBehavior ${getBehaviorTimeTotal.toFixed(2)}ms, tick total ${tickTimeTotal.toFixed(2)}ms`)
    }
  }
}
