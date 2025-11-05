import type { IBehavior } from '../../models/interfaces/IBehavior'
import { Position } from '../../models/Position'

/**
 * MovableBehavior - Permet à une entité de se déplacer
 * Stocke le vecteur de mouvement actuel
 */
export class MovableBehavior implements IBehavior {
  name = 'movable'
  vector: Position

  constructor() {
    this.vector = new Position(0, 0)
  }

  tick(performanceNow: number): any {
    return null
  }

  /**
   * Définit le vecteur de mouvement
   * @param vector Nouveau vecteur de mouvement
   */
  moveTo(vector: Position): void {
    this.vector = vector
  }

  /**
   * Arrête le mouvement (vecteur à zéro)
   */
  stay(): void {
    this.vector.row = 0
    this.vector.col = 0
  }
}
