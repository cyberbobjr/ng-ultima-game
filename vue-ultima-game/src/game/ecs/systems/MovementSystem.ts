import _ from 'lodash'
import type { Entity } from '../entities/Entity'
import type { MovableBehavior } from '../behaviors/MovableBehavior'
import type { PositionBehavior } from '../behaviors/PositionBehavior'
import type { SavestateBehavior } from '../behaviors/SavestateBehavior'
import { Position } from '../../models/Position'
import { useMapStore } from '@/stores/useMapStore'
import type { IPortal } from '@/game/models/interfaces/IPortal'

const NORMAL_MOVE_SPEED = 1

// Type pour les callbacks de détection de portail
export type PortalDetectedCallback = (portal: IPortal, entity: Entity) => void

/**
 * MovementSystem - Gère les mouvements de toutes les entités
 * Gère les collisions, la walkability, les vitesses de terrain, etc.
 *
 * NOTE: Cette version est simplifiée pour la Phase 2
 * En Phase 3, elle sera complétée avec les stores Pinia pour:
 * - MapsService → useMapStore
 * - DescriptionsService → useUIStore
 * - EntitiesService → useEntityStore
 * - ScenegraphService → useGameStore
 * - TilesLoaderService → useMapStore
 */
export class MovementSystem {
  private onPortalDetected: PortalDetectedCallback | null = null

  /**
   * Définit le callback appelé quand un portail est détecté
   */
  setOnPortalDetected(callback: PortalDetectedCallback): void {
    this.onPortalDetected = callback
  }

  /**
   * Traite les mouvements de toutes les entités
   * @param entities Liste des entités
   */
  processMovementsBehavior(entities: Entity[]): void {
    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('movable') && this._isEntityMoving(entity)) {
        this._processMovementsForEntity(entity, entities)
      }
    })
  }

  /**
   * Vérifie si une entité est en mouvement
   */
  private _isEntityMoving(entity: Entity): boolean {
    const movableBehavior = entity.getBehavior('movable') as MovableBehavior
    return this._isMoving(movableBehavior.vector)
  }

  /**
   * Vérifie si un vecteur indique un mouvement
   */
  private _isMoving(vectorDirection: Position): boolean {
    return vectorDirection.col !== 0 || vectorDirection.row !== 0
  }

  /**
   * Traite le mouvement d'une entité spécifique
   */
  private _processMovementsForEntity(entity: Entity, allEntities: Entity[]): void {
    const destinationPosition = this._getDestinationPositionForEntity(entity)

    if (this._canWalkAtDestinationPosition(entity, destinationPosition, allEntities)) {
      this._moveEntity(entity)

      // Auto-save après le mouvement
      this._autoSaveEntity(entity)

      // Détecter les portails (entrées de villes/villages)
      this._checkForPortal(entity)
    } else {
      console.log('Blocked!')
    }

    this._setEntityStay(entity)
  }

  /**
   * Sauvegarde automatique de la position d'une entité
   */
  private _autoSaveEntity(entity: Entity): void {
    if (entity.hasBehavior('savestate') && entity.hasBehavior('position')) {
      const savestateBehavior = entity.getBehavior('savestate') as SavestateBehavior
      const positionBehavior = entity.getBehavior('position') as PositionBehavior

      savestateBehavior.storeKeyValue('position', positionBehavior.position)

      // Debug log uniquement pour le joueur
      if (entity.name === 'Avatar') {
        const pos = positionBehavior.position
        console.log(`💾 Auto-save: Player position saved (${pos.row}, ${pos.col}) on map ${pos.mapId}`)
      }
    }
  }

  /**
   * Vérifie si l'entité est sur un portail (entrée de ville/village)
   */
  private _checkForPortal(entity: Entity): void {
    if (!entity.hasBehavior('position')) return

    const mapStore = useMapStore()
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const portal = mapStore.getPortalForPosition(positionBehavior.position)

    if (portal && this.onPortalDetected) {
      console.log(`🚪 Portal détecté: ${portal.destmapid} à (${positionBehavior.position.row}, ${positionBehavior.position.col})`)
      this.onPortalDetected(portal, entity)
    }
  }

  /**
   * Vérifie si on peut marcher à une position de destination
   */
  private _canWalkAtDestinationPosition(
    entity: Entity,
    destinationPosition: Position,
    allEntities: Entity[]
  ): boolean {
    const mapStore = useMapStore()

    // Vérifier si la position est hors limites
    if (mapStore.isPositionOutOfBounds(destinationPosition)) {
      return false
    }

    // Vérifier la walkability de la tuile
    if (!mapStore.isTileAtPositionIsWalkable(destinationPosition)) {
      return false
    }

    // Vérifier les collisions avec les autres entités
    if (this._isEntityCollidable(entity)) {
      const collidableEntities = this._getEntityCollidableAtPosition(
        destinationPosition,
        allEntities
      )
      if (collidableEntities.length > 0) {
        return false
      }
    }

    return true
  }

  /**
   * Vérifie si une entité a des collisions
   */
  private _isEntityCollidable(entity: Entity): boolean {
    return entity.hasBehavior('collide')
  }

  /**
   * Récupère les entités avec collision à une position
   */
  private _getEntityCollidableAtPosition(
    position: Position,
    allEntities: Entity[]
  ): Entity[] {
    const entitiesAtPosition = allEntities.filter((entity) => {
      if (!entity.hasBehavior('position')) return false
      const pos = entity.getPosition()
      return pos.isEqual(position)
    })

    return _.filter(entitiesAtPosition, (entity: Entity) => {
      return this._isEntityCollidable(entity)
    })
  }

  /**
   * Arrête le mouvement d'une entité
   */
  private _setEntityStay(entity: Entity): void {
    const movableEntity = entity.getBehavior('movable') as MovableBehavior
    movableEntity.stay()
  }

  /**
   * Récupère la position de destination d'une entité
   */
  private _getDestinationPositionForEntity(entity: Entity): Position {
    const entityDirection = entity.getBehavior('movable') as MovableBehavior
    const currentEntityPosition = entity.getBehavior('position') as PositionBehavior
    return currentEntityPosition.position.addVector(entityDirection.vector)
  }

  /**
   * Déplace une entité
   */
  private _moveEntity(entity: Entity): void {
    const movableBehavior = entity.getBehavior('movable') as MovableBehavior
    const positionBehavior = entity.getBehavior('position') as PositionBehavior

    positionBehavior.moveTo(movableBehavior.vector)

    const moveInformationText = this._getTextMoveDirection(movableBehavior.vector)
    this._displayInformation(entity, moveInformationText)
  }

  /**
   * Convertit un vecteur de mouvement en texte de direction
   */
  private _getTextMoveDirection(vector: Position): string {
    let direction = ''

    if (vector.col === 1) {
      direction = 'East'
    }
    if (vector.col === -1) {
      direction = 'West'
    }
    if (vector.row === 1) {
      direction = 'South'
    }
    if (vector.row === -1) {
      direction = 'North'
    }

    return direction
  }

  /**
   * Affiche une information
   * TODO Phase 3: Utiliser UIStore
   */
  private _displayInformation(entity: Entity, textToDisplay: string): void {
    if (entity.isDisplayInfo) {
      console.log(textToDisplay)
      // TODO Phase 3: useUIStore().addLogInformation(textToDisplay)
    }
  }
}
