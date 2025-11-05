import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * CollideBehavior - Marque une entité comme ayant des collisions
 * La logique de collision est gérée par le MovementSystem
 */
export class CollideBehavior implements IBehavior {
  name = 'collide'

  constructor() {}

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }
}
