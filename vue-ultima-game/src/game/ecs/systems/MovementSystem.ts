import _ from 'lodash'
import type { Entity } from '../entities/Entity'
import type { MovableBehavior } from '../behaviors/MovableBehavior'
import type { PositionBehavior } from '../behaviors/PositionBehavior'
import type { SavestateBehavior } from '../behaviors/SavestateBehavior'
import { Position } from '../../models/Position'
import { useMapStore } from '@/stores/useMapStore'
import { useUIStore } from '@/stores/useUIStore'
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
    // BENCHMARK: Mesurer le temps de construction de la spatial map
    const beforeSpatialMap = performance.now()
    const spatialMap = this._buildSpatialMap(entities)
    const spatialMapTime = performance.now() - beforeSpatialMap

    // BENCHMARK: Mesurer le temps de traitement des mouvements
    const beforeMovements = performance.now()
    let movingEntityCount = 0

    entities.forEach((entity: Entity) => {
      if (entity.hasBehavior('movable') && this._isEntityMoving(entity)) {
        movingEntityCount++
        this._processMovementsForEntity(entity, entities, spatialMap)
      }
    })

    const movementsTime = performance.now() - beforeMovements
    const totalTime = spatialMapTime + movementsTime

    if (totalTime > 50) {  // Log seulement si > 50ms
      console.log(`🔍 MovementSystem: spatial map ${spatialMapTime.toFixed(2)}ms, ${movingEntityCount} movements ${movementsTime.toFixed(2)}ms, total ${totalTime.toFixed(2)}ms`)
    }
  }

  /**
   * Construit une Map spatiale: "row,col" → entités à cette position
   * Permet des lookups O(1) au lieu de filter O(n) pour les collisions
   */
  private _buildSpatialMap(entities: Entity[]): Map<string, Entity[]> {
    const spatialMap = new Map<string, Entity[]>()

    for (const entity of entities) {
      if (!entity.hasBehavior('position')) continue

      const pos = entity.getPosition()
      const key = `${pos.row},${pos.col}`

      if (!spatialMap.has(key)) {
        spatialMap.set(key, [])
      }
      spatialMap.get(key)!.push(entity)
    }

    return spatialMap
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
  private _processMovementsForEntity(
    entity: Entity,
    allEntities: Entity[],
    spatialMap: Map<string, Entity[]>
  ): void {
    // BENCHMARK: Seulement pour le joueur
    const isPlayer = entity.name === 'Avatar'
    const startTime = isPlayer ? performance.now() : 0

    const destinationPosition = this._getDestinationPositionForEntity(entity)

    if (this._canWalkAtDestinationPosition(entity, destinationPosition, allEntities, spatialMap)) {
      this._moveEntity(entity)

      if (isPlayer) {
        const afterMove = performance.now()
        console.log(`⏱️ [3] Movement executed in ${(afterMove - startTime).toFixed(2)}ms`)
      }

      // Auto-save après le mouvement
      this._autoSaveEntity(entity)

      // Détection de bordure pour sortie automatique - UNIQUEMENT pour le joueur
      if (entity.name === 'Avatar') {
        this._checkBorderExit(entity)
      }
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

    // Détection à 1 tile du bord (distance maximale de 1)
    // Inclut le bord lui-même (distance 0) et la tile adjacente (distance 1)
    // Pour une carte 32x32 : rows 0,1 (haut) et 30,31 (bas)
    const isOnBorder =
      position.row <= 1 ||
      position.row >= height - 2 ||
      position.col <= 1 ||
      position.col >= width - 2

    if (isOnBorder) {
      // Récupérer la position d'entrée sauvegardée
      const entryPositionStr = localStorage.getItem('worldmap_entry_position')
      if (entryPositionStr) {
        const entryPosition = JSON.parse(entryPositionStr)

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
      if (this.onPortalDetected) {
        this.onPortalDetected(portal, entity)
      }
      return true
    }

    return false
  }

  /**
   * Tente d'ouvrir une porte à la position actuelle de l'entité
   * Vérifie les 4 directions autour du joueur (haut, bas, gauche, droite)
   * Doit être appelé quand le joueur appuie sur "O"
   * @param entity L'entité qui veut ouvrir la porte
   * @param onDoorClosed Callback optionnel appelé quand la porte se referme (pour rafraîchir l'affichage)
   */
  checkAndOpenDoor(entity: Entity, onDoorClosed?: () => void): boolean {
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
        mapStore.openDoorAtPosition(direction, onDoorClosed)
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
        return npc
      }
    }

    return null
  }

  /**
   * Vérifie si l'entité est sur un portail "klimb" et effectue la montée
   * Doit être appelé quand le joueur appuie sur "K"
   * @param entity L'entité qui veut grimper
   * @returns true si un portail klimb a été trouvé et activé
   */
  checkAndKlimb(entity: Entity): boolean {
    if (!entity.hasBehavior('position')) return false

    const mapStore = useMapStore()
    const uiStore = useUIStore()
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const portal = mapStore.getPortalForPosition(positionBehavior.position)

    if (portal && portal.action === 'klimb') {
      // Afficher le message du portail si disponible
      if (portal.message) {
        uiStore.addTextToInformation(portal.message)
      }

      // Déclencher la transition de carte via le callback
      if (this.onPortalDetected) {
        this.onPortalDetected(portal, entity)
      }

      return true
    }

    // Aucun portail klimb à cette position
    uiStore.addTextToInformation('Klimb what?')
    return false
  }

  /**
   * Vérifie si l'entité est sur un portail "descend" et effectue la descente
   * Doit être appelé quand le joueur appuie sur "D"
   * @param entity L'entité qui veut descendre
   * @returns true si un portail descend a été trouvé et activé
   */
  checkAndDescend(entity: Entity): boolean {
    if (!entity.hasBehavior('position')) return false

    const mapStore = useMapStore()
    const uiStore = useUIStore()
    const positionBehavior = entity.getBehavior('position') as PositionBehavior
    const portal = mapStore.getPortalForPosition(positionBehavior.position)

    if (portal && portal.action === 'descend') {
      // Afficher le message du portail si disponible
      if (portal.message) {
        uiStore.addTextToInformation(portal.message)
      }

      // Déclencher la transition de carte via le callback
      if (this.onPortalDetected) {
        this.onPortalDetected(portal, entity)
      }

      return true
    }

    // Aucun portail descend à cette position
    uiStore.addTextToInformation('Descend what?')
    return false
  }

  /**
   * Vérifie si on peut marcher à une position de destination
   */
  private _canWalkAtDestinationPosition(
    entity: Entity,
    destinationPosition: Position,
    allEntities: Entity[],
    spatialMap: Map<string, Entity[]>
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
      const collidableEntities = this._getEntityCollidableAtPositionFast(
        destinationPosition,
        spatialMap
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
   * Récupère les entités avec collision à une position en utilisant la spatial map
   * OPTIMISATION: O(1) lookup au lieu de O(n) filter
   */
  private _getEntityCollidableAtPositionFast(
    position: Position,
    spatialMap: Map<string, Entity[]>
  ): Entity[] {
    const key = `${position.row},${position.col}`
    const entitiesAtPosition = spatialMap.get(key) || []

    // Filtrer seulement les entités collidables parmi celles à cette position
    // C'est typiquement 0-2 entités au lieu de 30, donc très rapide
    return entitiesAtPosition.filter((entity: Entity) => {
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
      // TODO Phase 3: useUIStore().addLogInformation(textToDisplay)
    }
  }
}
