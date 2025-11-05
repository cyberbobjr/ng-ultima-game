import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * TravelcityBehavior - Marque une entité comme capable de voyager entre les villes
 * La logique de voyage est gérée par le système de portails
 */
export class TravelcityBehavior implements IBehavior {
  name = 'travelcity'

  constructor() {}

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }
}
