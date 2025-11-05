import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * KeycontrolBehavior - Marque une entité comme contrôlable par le clavier
 * La logique de contrôle est gérée par le KeyboardInputSystem
 */
export class KeycontrolBehavior implements IBehavior {
  name = 'keycontrol'

  constructor() {}

  tick(performanceNow: number): any {
    return null
  }
}
