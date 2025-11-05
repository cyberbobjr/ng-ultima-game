import type { Entity } from '../entities/Entity'
import type { PositionBehavior } from '../behaviors/PositionBehavior'
import type { SavestateBehavior } from '../behaviors/SavestateBehavior'

const TIMER_INTERVAL_SECONDS = 5000

/**
 * SaveStateSystem - Sauvegarde périodiquement l'état des entités dans localStorage
 */
export class SaveStateSystem {
  private lastPerformanceNow: number = 0

  /**
   * Traite la sauvegarde périodique de l'état des entités
   * @param entities Liste des entités à sauvegarder
   */
  processTick(entities: Entity[]): void {
    const performanceNow = performance.now()

    if (performanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
      entities.forEach((entity: Entity) => {
        if (entity.hasBehavior('savestate') && entity.hasBehavior('position')) {
          const positionBehavior = entity.getBehavior('position') as PositionBehavior
          const savestateBehavior = entity.getBehavior('savestate') as SavestateBehavior

          // Sauvegarde la position
          savestateBehavior.storeKeyValue('position', positionBehavior.position)

          // TODO: Sauvegarder d'autres propriétés (santé, inventaire, etc.)
        }
      })

      this.lastPerformanceNow = performanceNow
    }
  }

  /**
   * Force une sauvegarde immédiate
   * @param entities Liste des entités à sauvegarder
   */
  forceSave(entities: Entity[]): void {
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('savestate') && entity.hasBehavior('position')) {
        const positionBehavior = entity.getBehavior('position') as PositionBehavior
        const savestateBehavior = entity.getBehavior('savestate') as SavestateBehavior
        savestateBehavior.storeKeyValue('position', positionBehavior.position)
      }
    })
  }
}
