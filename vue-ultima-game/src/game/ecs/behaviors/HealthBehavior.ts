import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * HealthBehavior - Gère les points de vie d'une entité
 */
export class HealthBehavior implements IBehavior {
  name = 'health'
  private _currentHealth: number = 0
  private _maxHealth: number

  constructor(health: number) {
    this._maxHealth = health
    this._currentHealth = health
  }

  tick(performanceNow: number): any {
    // Pas de logique de tick pour le moment
  }

  /**
   * Inflige des dégâts à l'entité
   * @param numberOfDamage Nombre de points de dégâts
   */
  takeDamages(numberOfDamage: number): void {
    this._currentHealth -= numberOfDamage
    if (this._currentHealth < 0) {
      this._currentHealth = 0
    }
  }

  /**
   * Restaure des points de vie
   * @param restoreNumber Nombre de points à restaurer
   */
  restoreHealth(restoreNumber: number): void {
    this._currentHealth += restoreNumber
    if (this._currentHealth > this._maxHealth) {
      this._currentHealth = this._maxHealth
    }
  }

  /**
   * @returns Points de vie actuels
   */
  getHealth(): number {
    return this._currentHealth
  }

  /**
   * @returns Points de vie maximum
   */
  getMaxHealth(): number {
    return this._maxHealth
  }

  /**
   * @returns true si l'entité est morte
   */
  isDead(): boolean {
    return this._currentHealth <= 0
  }
}
