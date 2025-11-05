import type { IBehavior } from '../../models/interfaces/IBehavior'
import { Position } from '../../models/Position'

/**
 * PositionBehavior - Gère la position d'une entité sur la carte
 */
export class PositionBehavior implements IBehavior {
  name = 'position'
  position: Position

  constructor(position: Position) {
    this.position = position
  }

  tick(performanceNow: number): any {
    return null
  }

  /**
   * Déplace l'entité selon un vecteur de direction
   * @param directionVector Vecteur de déplacement
   */
  moveTo(directionVector: Position): void {
    this.position = this.position.addVector(directionVector)
  }

  /**
   * Téléporte l'entité à une nouvelle position
   * @param position Nouvelle position
   */
  setNewPosition(position: Position): void {
    this.position = position
  }
}
