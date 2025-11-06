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

      // Détection de bordure pour sortie automatique (sauf sur world map)
      this._checkBorderExit(entity)
    } else {
      console.log('Blocked!')
    }

    this._setEntityStay(entity)
  }

  /**
   * Vérifie si l'entité est sur les 2 tiles du bord et déclenche la sortie automatique
   * Seulement pour les cartes autres que la world map (villes, donjons, etc.)
   */
  private _checkBorderExit(entity: Entity): void {
    const mapStore = useMapStore()

    // Si on est sur la world map, ne rien faire
    if (mapStore.isCurrentMapWorldMap()) {
      return
    }

    // Vérifier si on est sur les 2 tiles du bord
    if (!entity.hasBehavior('position')) return

    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const position = positionBehavior.position
    const currentMap = mapStore.getCurrentMap()

    if (!currentMap) return

    const width = currentMap.width
    const height = currentMap.height

    // Détection des 2 tiles du bord (row < 2, row >= height-2, col < 2, col >= width-2)
    const isOnBorder =
      position.row < 2 ||
      position.row >= height - 2 ||
      position.col < 2 ||
      position.col >= width - 2

    if (isOnBorder) {
      console.log(`🚪 Sortie automatique : bordure détectée à (${position.row}, ${position.col})`)

      // Récupérer la position d'entrée sauvegardée
      const entryPositionStr = localStorage.getItem('worldmap_entry_position')
      if (entryPositionStr) {
        const entryPosition = JSON.parse(entryPositionStr)
        console.log(`🗺️  Retour à la position d'entrée: (${entryPosition.row}, ${entryPosition.col})`)

        // Créer un portail virtuel pour la transition
        const returnPortal: IPortal = {
          x: position.col.toString(),
          y: position.row.toString(),
          destmapid: '0', // World map
          startx: entryPosition.col.toString(),
          starty: entryPosition.row.toString(),
          action: 'exit',
          savelocation: 'true',
          transport: 'foot'
        }

        if (this.onPortalDetected) {
          this.onPortalDetected(returnPortal, entity)
        }

        // Nettoyer la position d'entrée sauvegardée
        localStorage.removeItem('worldmap_entry_position')
      } else {
        console.warn('⚠️  Aucune position d\'entrée sauvegardée trouvée')
      }
    }
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
   * Vérifie manuellement si l'entité est sur un portail et l'active
   * Doit être appelé quand le joueur appuie sur "E" (sur la world map uniquement)
   */
  checkAndActivatePortal(entity: Entity): boolean {
    if (!entity.hasBehavior('position')) return false

    const mapStore = useMapStore()
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const portal = mapStore.getPortalForPosition(positionBehavior.position)

    if (portal) {
      console.log(`🚪 Entrée manuelle via portail (touche E): destination map ${portal.destmapid}`)
      if (this.onPortalDetected) {
        this.onPortalDetected(portal, entity)
      }
      return true
    }

    console.log('❌ Aucun portail à cette position')
    return false
  }

  /**
   * Tente d'ouvrir une porte à la position actuelle de l'entité
   * Vérifie les 4 directions autour du joueur (haut, bas, gauche, droite)
   * Doit être appelé quand le joueur appuie sur "O"
   */
  checkAndOpenDoor(entity: Entity): boolean {
    if (!entity.hasBehavior('position')) return false

    const mapStore = useMapStore()
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const currentPos = positionBehavior.position

    // Vérifier les 4 directions autour du joueur
    // IMPORTANT: addVector() pour obtenir les positions absolues, pas les vecteurs relatifs
    const directions = [
      currentPos.addVector(currentPos.getVectorUp()),    // Haut
      currentPos.addVector(currentPos.getVectorDown()),  // Bas
      currentPos.addVector(currentPos.getVectorLeft()),  // Gauche
      currentPos.addVector(currentPos.getVectorRight())  // Droite
    ]

    for (const direction of directions) {
      if (mapStore.isTileAtPositionIsClosedDoor(direction)) {
        console.log(`🚪 Porte fermée trouvée à (${direction.row}, ${direction.col}) - Ouverture...`)
        mapStore.openDoorAtPosition(direction)
        console.log('✅ Porte ouverte!')
        return true
      }
    }

    return false
  }

  /**
   * Cherche un NPC à proximité du joueur pour parler
   * Vérifie les 4 directions autour du joueur (haut, bas, gauche, droite)
   * Doit être appelé quand le joueur appuie sur "T"
   * @param entity L'entité qui veut parler (le joueur)
   * @param allEntities Liste de toutes les entités sur la carte
   * @returns L'entité NPC trouvée, ou null si aucun NPC n'est à proximité
   */
  findNpcToTalkTo(entity: Entity, allEntities: Entity[]): Entity | null {
    if (!entity.hasBehavior('position')) return null

    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const currentPos = positionBehavior.position

    // Vérifier les 4 directions autour du joueur
    // IMPORTANT: addVector() pour obtenir les positions absolues, pas les vecteurs relatifs
    const directions = [
      currentPos.addVector(currentPos.getVectorUp()),    // Haut
      currentPos.addVector(currentPos.getVectorDown()),  // Bas
      currentPos.addVector(currentPos.getVectorLeft()),  // Gauche
      currentPos.addVector(currentPos.getVectorRight())  // Droite
    ]

    // Chercher un NPC dans ces directions
    for (const direction of directions) {
      const npc = allEntities.find((e) => {
        if (!e.hasBehavior('position')) return false
        if (e === entity) return false // Pas soi-même

        const npcPos = (e.getBehavior('position') as PositionBehavior).position

        // Vérifier si le NPC est à cette position
        if (npcPos.row === direction.row && npcPos.col === direction.col && npcPos.mapId === direction.mapId) {
          // Vérifier si le NPC a un behavior de conversation
          return e.hasBehavior('talk') || e.hasBehavior('vendortalk')
        }
        return false
      })

      if (npc) {
        console.log(`💬 NPC trouvé à (${direction.row}, ${direction.col}): ${npc.name}`)
        return npc
      }
    }

    console.log('❌ Aucun NPC à proximité')
    return null
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
