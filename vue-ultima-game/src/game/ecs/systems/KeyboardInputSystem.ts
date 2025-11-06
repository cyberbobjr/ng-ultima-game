import type { Entity } from '../entities/Entity'
import type { MovableBehavior } from '../behaviors/MovableBehavior'
import type { PositionBehavior } from '../behaviors/PositionBehavior'
import { Position } from '../../models/Position'

// Constantes de touches
const KEY_UP = 'ArrowUp'
const KEY_DOWN = 'ArrowDown'
const KEY_LEFT = 'ArrowLeft'
const KEY_RIGHT = 'ArrowRight'
const KEY_ENTER = 'KeyE'
const KEY_OPEN = 'KeyO'
const KEY_TALK = 'KeyT'
const KEY_KLIMB = 'KeyK'
const KEY_DESCEND = 'KeyD'
const KEY_ESC = 'Escape'

/**
 * KeyboardInputSystem - Gère les entrées clavier du joueur
 *
 * NOTE: Cette version est simplifiée pour la Phase 2
 * En Phase 3, elle sera complétée avec les stores Pinia pour:
 * - MapsService → useMapStore
 * - DescriptionsService → useUIStore
 * - TalkingService → useTalkingStore
 * - EntitiesService → useEntityStore
 */
export class KeyboardInputSystem {
  // Callback pour l'activation des portails
  private onPortalActivationRequested?: (entity: Entity) => void

  /**
   * Configure le callback pour l'activation des portails
   */
  setOnPortalActivationRequested(callback: (entity: Entity) => void): void {
    this.onPortalActivationRequested = callback
  }

  /**
   * Traite les entrées clavier pour toutes les entités contrôlables
   * @param event Événement clavier
   * @param entities Liste des entités
   */
  processKeyboardInput(event: KeyboardEvent, entities: Entity[]): void {
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('keycontrol')) {
        this._processKeyboardInputMovement(event, entity)
      }
    })
  }

  /**
   * Traite les mouvements au clavier
   */
  private _processKeyboardInputMovement(event: KeyboardEvent, entity: Entity): void {
    const movableBehavior = entity.getBehavior('movable') as MovableBehavior
    const entityPosition = this._getEntityPosition(entity)

    switch (event.code) {
      case KEY_UP:
      case KEY_DOWN:
      case KEY_LEFT:
      case KEY_RIGHT:
        movableBehavior.moveTo(this._getVectorDirectionForKey(event.code, entityPosition))
        break

      case KEY_ENTER:
        // Activer le portail via le callback
        console.log('🔑 Touche E pressée - vérification du portail...')
        if (this.onPortalActivationRequested) {
          this.onPortalActivationRequested(entity)
        }
        break

      case KEY_OPEN:
        // TODO: Implémenter l'ouverture des portes (Phase 3)
        console.log('Open pressed - doors will be implemented in Phase 3')
        break

      case KEY_TALK:
        // TODO: Implémenter les dialogues (Phase 3)
        console.log('Talk pressed - conversations will be implemented in Phase 3')
        break

      case KEY_KLIMB:
        // TODO: Implémenter klimb (Phase 3)
        console.log('Klimb pressed - will be implemented in Phase 3')
        break

      case KEY_DESCEND:
        // TODO: Implémenter descend (Phase 3)
        console.log('Descend pressed - will be implemented in Phase 3')
        break
    }
  }

  /**
   * Récupère la position d'une entité
   */
  private _getEntityPosition(entity: Entity): Position {
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    return positionBehavior.position
  }

  /**
   * Convertit une touche en vecteur de direction
   */
  private _getVectorDirectionForKey(keycode: string, destPosition: Position): Position {
    switch (keycode) {
      case KEY_UP:
        return destPosition.getVectorUp()
      case KEY_DOWN:
        return destPosition.getVectorDown()
      case KEY_LEFT:
        return destPosition.getVectorLeft()
      case KEY_RIGHT:
        return destPosition.getVectorRight()
      default:
        return new Position(0, 0, destPosition.mapId)
    }
  }
}
