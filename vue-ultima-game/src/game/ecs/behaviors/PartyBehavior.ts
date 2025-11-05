import type { IBehavior } from '../../models/interfaces/IBehavior'
import type { Entity } from '../entities/Entity'
import type { InventoryBehavior } from './InventoryBehavior'

/**
 * PartyBehavior - Gère le comportement d'un groupe (party)
 * Note: La gestion du groupe sera déléguée au PartyStore (Pinia) en Phase 3
 * Pour le moment, on conserve juste la structure de base
 */
export class PartyBehavior implements IBehavior {
  name = 'party'
  private _entityLeader: Entity
  private _members: Entity[] = []

  constructor(entityLeader: Entity) {
    this._entityLeader = entityLeader
    this._members = [entityLeader]
  }

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }

  /**
   * Calcule l'or total du groupe
   * @returns Total d'or du groupe
   */
  get partyGold(): number {
    let goldTotal = 0
    for (const entity of this._members) {
      goldTotal += this._getGoldEntity(entity)
    }
    return goldTotal
  }

  /**
   * Récupère l'or d'une entité
   */
  private _getGoldEntity(entity: Entity): number {
    if (entity.hasBehavior('inventory')) {
      const inventory = entity.getBehavior('inventory') as InventoryBehavior
      return inventory.gold
    }
    return 0
  }

  /**
   * Retire de l'or du groupe (distribué sur tous les membres)
   * @param amount Quantité à retirer
   */
  removeGold(amount: number): void {
    let remaining = amount
    for (const entity of this._members) {
      remaining = this._removeGoldForEntity(entity, remaining)
      if (remaining <= 0) break
    }
  }

  /**
   * Retire de l'or d'une entité spécifique
   */
  private _removeGoldForEntity(entity: Entity, amount: number): number {
    let remaining = 0
    if (entity.hasBehavior('inventory')) {
      const entityInventory = entity.getBehavior('inventory') as InventoryBehavior
      if (entityInventory.gold <= amount) {
        remaining = amount - entityInventory.gold
        entityInventory.gold = 0
      } else {
        entityInventory.gold -= amount
      }
    }
    return remaining
  }

  /**
   * Ajoute un membre au groupe
   */
  addMember(entity: Entity): void {
    if (!this._members.includes(entity)) {
      this._members.push(entity)
    }
  }

  /**
   * Retire un membre du groupe
   */
  removeMember(entity: Entity): void {
    const index = this._members.indexOf(entity)
    if (index > -1) {
      this._members.splice(index, 1)
    }
  }

  /**
   * @returns Tous les membres du groupe
   */
  get members(): Entity[] {
    return this._members
  }

  /**
   * @returns Le leader du groupe
   */
  get leader(): Entity {
    return this._entityLeader
  }
}
