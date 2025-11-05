import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * InventoryBehavior - Gère l'inventaire d'une entité (or, objets, etc.)
 */
export class InventoryBehavior implements IBehavior {
  name = 'inventory'
  private _gold: number = 0
  private _items: any[] = [] // TODO: Typer correctement quand le système d'items sera implémenté

  constructor(startGold: number = 100) {
    this._gold = startGold
  }

  /**
   * Quantité d'or possédée
   */
  get gold(): number {
    return this._gold
  }

  set gold(amount: number) {
    this._gold = Math.max(0, amount) // Ne peut pas être négatif
  }

  /**
   * Liste des objets
   */
  get items(): any[] {
    return this._items
  }

  /**
   * Ajoute de l'or
   * @param amount Quantité à ajouter
   */
  addGold(amount: number): void {
    this._gold += amount
  }

  /**
   * Retire de l'or
   * @param amount Quantité à retirer
   * @returns true si l'or a pu être retiré
   */
  removeGold(amount: number): boolean {
    if (this._gold >= amount) {
      this._gold -= amount
      return true
    }
    return false
  }

  /**
   * Vérifie si l'entité a assez d'or
   * @param amount Quantité à vérifier
   */
  hasGold(amount: number): boolean {
    return this._gold >= amount
  }

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }
}
