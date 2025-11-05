import _ from 'lodash'
import type { Entity } from '../entities/Entity'
import type { MovableBehavior } from '../behaviors/MovableBehavior'
import type { PositionBehavior } from '../behaviors/PositionBehavior'
import { Position } from '../../models/Position'

const NORMAL_MOVE_SPEED = 1

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

    // Pour la Phase 2, on fait un mouvement simplifié sans vérification de walkability
    // TODO Phase 3: Ajouter les vérifications de walkability, collisions, etc.
    if (this._canWalkAtDestinationPosition(entity, destinationPosition, allEntities)) {
      this._moveEntity(entity)
    } else {
      console.log('Blocked!')
    }

    this._setEntityStay(entity)
  }

  /**
   * Vérifie si on peut marcher à une position de destination
   * Version simplifiée pour Phase 2
   */
  private _canWalkAtDestinationPosition(
    entity: Entity,
    destinationPosition: Position,
    allEntities: Entity[]
  ): boolean {
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

    // TODO Phase 3: Vérifier la walkability via MapStore
    // Pour Phase 2, on autorise tous les mouvements
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
