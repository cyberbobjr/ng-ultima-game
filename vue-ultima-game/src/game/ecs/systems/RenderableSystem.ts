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
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('renderable')) {
        const renderableBehavior = entity.getBehavior('renderable') as RenderableBehavior
        renderableBehavior.tick(performance.now())
      }
    })
  }
}
