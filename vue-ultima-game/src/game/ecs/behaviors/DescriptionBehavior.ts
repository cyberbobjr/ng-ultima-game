import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * DescriptionBehavior - Marque une entité comme ayant une description
 * Utilisé pour afficher des informations dans l'UI
 */
export class DescriptionBehavior implements IBehavior {
  name = 'description'

  constructor() {}

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }
}
