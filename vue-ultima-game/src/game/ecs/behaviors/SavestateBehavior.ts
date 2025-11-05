import type { IBehavior } from '../../models/interfaces/IBehavior'

/**
 * SavestateBehavior - Gère la sauvegarde de l'état d'une entité dans localStorage
 */
export class SavestateBehavior implements IBehavior {
  name = 'savestate'
  private _storageKey: string = ''

  constructor(storageKey: string) {
    this._storageKey = `vue-ultima ${storageKey}`
  }

  tick(performanceNow: number): any {
    return null
  }

  /**
   * @returns Clé de stockage pour cette entité
   */
  getStorageKey(): string {
    return this._storageKey
  }

  /**
   * Sauvegarde une valeur dans le localStorage
   * @param key Clé de la valeur
   * @param value Valeur à sauvegarder
   */
  storeKeyValue(key: string, value: any): void {
    try {
      window.localStorage.setItem(`${this._storageKey}.${key}`, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Charge une valeur depuis le localStorage
   * @param key Clé de la valeur
   * @returns Valeur chargée ou null
   */
  loadKey(key: string): any {
    try {
      const item = window.localStorage.getItem(`${this._storageKey}.${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return null
    }
  }

  /**
   * Supprime une valeur du localStorage
   * @param key Clé de la valeur
   */
  removeKey(key: string): void {
    try {
      window.localStorage.removeItem(`${this._storageKey}.${key}`)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  /**
   * Supprime toutes les valeurs de cette entité du localStorage
   */
  clearAll(): void {
    try {
      const keys = Object.keys(window.localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this._storageKey)) {
          window.localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
