import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import _ from 'lodash'
import { GameMap } from '@/game/models/GameMap'
import { Tileset } from '@/game/models/Tileset'
import { Position } from '@/game/models/Position'
import type { ITile } from '@/game/models/interfaces/ITile'
import type { ITileset } from '@/game/models/interfaces/ITileset'
import type { IMapMetaData } from '@/game/models/interfaces/IMap'
import type { IPortal } from '@/game/models/interfaces/IPortal'
import { Entity } from '@/game/ecs/entities/Entity'

/**
 * useMapStore - Gère les cartes et les tuiles
 * Remplace MapsService et TilesLoaderService
 */
export const useMapStore = defineStore('map', () => {
  // État - Maps
  const currentMap = ref<GameMap | null>(null)
  const mapsMetaData = ref<Array<IMapMetaData>>([])

  // État - Tiles
  const tileset = ref<Tileset | null>(null)
  const tilesRules = ref<any>(null)
  const numberOfTilesLoaded = ref(0)
  const totalTilesToLoad = ref(0)

  // Computed
  const isMapLoaded = computed(() => currentMap.value !== null)
  const areTilesLoaded = computed(
    () => tileset.value !== null && numberOfTilesLoaded.value === totalTilesToLoad.value
  )
  const loadingProgress = computed(() => {
    if (totalTilesToLoad.value === 0) return 0
    return (numberOfTilesLoaded.value / totalTilesToLoad.value) * 100
  })

  // ========== MAPS ==========

  /**
   * Charge une carte par nom de fichier
   * @param mapFilename Nom du fichier de la carte
   */
  async function loadMapByFilename(mapFilename: string): Promise<number[][]> {
    const response = await fetch(`/assets/maps/${mapFilename}`)
    const jsonValue = await response.json()
    return jsonValue as number[][]
  }

  /**
   * Charge une carte par son ID
   * @param mapId ID de la carte
   */
  async function loadMapByMapId(mapId: number): Promise<GameMap> {
    const mapMetaData = getMapMetadataByMapId(mapId)
    if (!mapMetaData) {
      throw new Error(`Map ${mapId} not found`)
    }

    const mapData = await loadMapByFilename(mapMetaData.fname)
    currentMap.value = new GameMap(mapMetaData, mapData)
    return currentMap.value as GameMap
  }

  /**
   * Charge toutes les métadonnées des cartes
   */
  async function loadAllMaps(): Promise<void> {
    const response = await fetch('/assets/maps.json')
    const jsonValue = await response.json()
    mapsMetaData.value = _.map(jsonValue.maps.map, (map: IMapMetaData) => map)
  }

  /**
   * Récupère les métadonnées d'une carte par ID
   * @param id ID de la carte
   */
  function getMapMetadataByMapId(id: number): IMapMetaData | undefined {
    return _.find(mapsMetaData.value, { id: id.toString() } as any)
  }

  /**
   * Récupère toutes les métadonnées des cartes
   */
  function getAllMaps(): Array<IMapMetaData> {
    return mapsMetaData.value
  }

  /**
   * Récupère la carte actuelle
   */
  function getCurrentMap(): GameMap | null {
    return currentMap.value as GameMap | null
  }

  /**
   * Récupère les entités sur la carte actuelle
   */
  function getEntitiesOnCurrentMap(): Entity[] {
    return currentMap.value ? currentMap.value.getEntitiesOnMap() : []
  }

  /**
   * Récupère l'index de la tuile à une position
   * @param position Position sur la carte
   */
  function getTileIndexAtPosition(position: Position): number {
    if (!currentMap.value) return 0
    try {
      return currentMap.value.getTileIndexAtPosition(position)
    } catch (err) {
      console.error('Error getting tile at position:', position, err)
      return 0
    }
  }

  /**
   * Vérifie si la position est en dehors des limites
   */
  function isPositionOutOfBounds(position: Position): boolean {
    if (!currentMap.value) return true
    if (position.row < 0 || position.col < 0) return true
    return (
      position.row > currentMap.value.getHeightMap() ||
      position.col > currentMap.value.getWidthMap()
    )
  }

  /**
   * Vérifie si une tuile est "walkable" à une position
   */
  function isTileAtPositionIsWalkable(position: Position): boolean {
    if (isPositionOutOfBounds(position)) return false
    const tileIndex = getTileIndexAtPosition(position)
    const tile = getTileByIndex(tileIndex)
    return tile ? isTileWalkable(tile.name) : false
  }

  /**
   * Vérifie si une tuile est opaque à une position
   */
  function isTileAtPositionIsOpaque(position: Position): boolean {
    const tileIndex = getTileIndexAtPosition(position)
    const tile = getTileByIndex(tileIndex)
    return tile ? isTileOpaque(tile.name) : false
  }

  /**
   * Vérifie si une tuile est une porte fermée
   */
  function isTileAtPositionIsClosedDoor(position: Position): boolean {
    const tileIndex = getTileIndexAtPosition(position)
    const tile = getTileByIndex(tileIndex)
    return tile ? isTileClosedDoor(tile.name) : false
  }

  /**
   * Vérifie si on peut parler par-dessus une tuile
   */
  function isTileAtPositionIsTalkOver(position: Position): boolean {
    const tileIndex = getTileIndexAtPosition(position)
    const tile = getTileByIndex(tileIndex)
    return tile ? isTileTalkOver(tile.name) : false
  }

  /**
   * Ouvre une porte à une position donnée
   */
  function openDoorAtPosition(position: Position): void {
    if (!currentMap.value || !tileset.value) return

    const tileIndex = getTileIndexAtPosition(position)
    const tile = getTileByIndex(tileIndex)

    if (tile && isTileClosedDoor(tile.name)) {
      // Trouver la tuile "porte ouverte"
      const openDoorTile = getTileByName('door')
      if (openDoorTile) {
        const newTileIndex = tileset.value.getTileIndexByName('door')
        currentMap.value.setTileIndexAtPosition(newTileIndex, position)
      }
    }
  }

  /**
   * Récupère un portail pour une position donnée
   */
  function getPortalForPosition(position: Position): IPortal | null {
    if (!currentMap.value || !currentMap.value.mapMetaData) return null

    const portals = (currentMap.value.mapMetaData as any).portal
    if (!portals) return null

    return _.find(portals, {
      x: position.col.toString(),
      y: position.row.toString()
    })
  }

  /**
   * Récupère les informations d'un portail pour un mapId
   */
  function getPortalInformationForMapId(currentMapId: number, destMapId: number): IPortal | null {
    const mapMetaData = getMapMetadataByMapId(currentMapId)
    if (!mapMetaData) return null

    const portals = (mapMetaData as any).portal
    if (!portals) return null

    return _.find(portals, { destmapid: destMapId.toString() })
  }

  /**
   * Récupère la position d'un portail
   */
  function getPositionOfPortal(portal: IPortal): Position {
    return new Position(parseInt(portal.starty, 10), parseInt(portal.startx, 10), parseInt(portal.destmapid, 10))
  }

  // ========== TILES ==========

  /**
   * Charge toutes les tuiles
   */
  async function loadTiles(): Promise<void> {
    await _loadJsonTilesRules()
    await _parseJsonTileDefinition()
  }

  /**
   * Charge les règles des tuiles
   */
  async function _loadJsonTilesRules(): Promise<void> {
    const response = await fetch('/assets/tiles_rules.json')
    const jsonValue = await response.json()
    tilesRules.value = jsonValue.tileRules.rule
  }

  /**
   * Parse la définition JSON des tuiles
   */
  async function _parseJsonTileDefinition(): Promise<void> {
    const tilesetData = await _loadJsonTileDefinition()
    tileset.value = new Tileset(tilesetData.name, tilesetData.tile)
    totalTilesToLoad.value = tileset.value.tile.length
    await _loadImagesTileset()
  }

  /**
   * Charge la définition JSON des tuiles
   */
  async function _loadJsonTileDefinition(): Promise<ITileset> {
    const response = await fetch('/assets/tiles.json')
    const jsonValue = await response.json()
    return jsonValue.tileset as ITileset
  }

  /**
   * Charge toutes les images du tileset
   */
  async function _loadImagesTileset(): Promise<void> {
    if (!tileset.value) return

    const promises = tileset.value.tile.map((tile) => _loadTileFileByName(tile.name, tile.id))

    await Promise.all(promises)
  }

  /**
   * Charge une image de tuile par nom
   */
  function _loadTileFileByName(name: string, tileId: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        if (tileset.value) {
          tileset.value.setImageForTileById(img, tileId)
        }
        numberOfTilesLoaded.value++
        resolve()
      }
      img.onerror = () => {
        console.error(`Failed to load tile: ${name}`)
        numberOfTilesLoaded.value++
        resolve()
      }
      img.src = `/assets/img/tile_${name}.png`
    })
  }

  /**
   * Récupère une tuile par index
   */
  function getTileByIndex(index: number): ITile | undefined {
    return tileset.value?.getTileAtIndex(index)
  }

  /**
   * Récupère une tuile par nom
   */
  function getTileByName(tileName: string): ITile | undefined {
    return _.find(tileset.value?.tile, { name: tileName })
  }

  /**
   * Vérifie si une tuile est opaque
   */
  function isTileOpaque(tileName: string): boolean {
    const tile = getTileByName(tileName)
    return tile ? _.has(tile, 'opaque') : false
  }

  /**
   * Vérifie si une tuile est walkable
   */
  function isTileWalkable(tileName: string): boolean {
    const tile = getTileByName(tileName)
    if (!tile) return false

    const rule = _getRuleName(tile.rule)
    const cantwalkon = _.get(rule, 'cantwalkon')

    return cantwalkon !== 'all'
  }

  /**
   * Vérifie si une tuile est une porte fermée
   */
  function isTileClosedDoor(tileName: string): boolean {
    const tile = getTileByName(tileName)
    if (!tile) return false

    const rule = _getRuleName(tile.rule)
    return _.has(rule, 'door')
  }

  /**
   * Vérifie si on peut parler par-dessus une tuile
   */
  function isTileTalkOver(tileName: string): boolean {
    const tile = getTileByName(tileName)
    if (!tile) return false

    const rule = _getRuleName(tile.rule)
    return _.has(rule, 'talkover')
  }

  /**
   * Récupère la vitesse de déplacement sur une tuile
   */
  function getTileSpeed(tileName: string): number {
    const tile = getTileByName(tileName)
    if (!tile) return 1

    const rule = _getRuleName(tile.rule)
    const speed = _.get(rule, 'speed')

    switch (speed) {
      case 'slow':
        return 1.1
      case 'vslow':
        return 1.5
      case 'vvslow':
        return 1.75
      default:
        return 1
    }
  }

  /**
   * Récupère une règle par nom
   */
  function _getRuleName(ruleName: string): any {
    return _.find(tilesRules.value, { name: ruleName })
  }

  return {
    // État
    currentMap,
    mapsMetaData,
    tileset,
    numberOfTilesLoaded,
    totalTilesToLoad,

    // Computed
    isMapLoaded,
    areTilesLoaded,
    loadingProgress,

    // Actions - Maps
    loadMapByFilename,
    loadMapByMapId,
    loadAllMaps,
    getMapMetadataByMapId,
    getAllMaps,
    getCurrentMap,
    getEntitiesOnCurrentMap,
    getTileIndexAtPosition,
    isPositionOutOfBounds,
    isTileAtPositionIsWalkable,
    isTileAtPositionIsOpaque,
    isTileAtPositionIsClosedDoor,
    isTileAtPositionIsTalkOver,
    openDoorAtPosition,
    getPortalForPosition,
    getPortalInformationForMapId,
    getPositionOfPortal,

    // Actions - Tiles
    loadTiles,
    getTileByIndex,
    getTileByName,
    isTileOpaque,
    isTileWalkable,
    isTileClosedDoor,
    isTileTalkOver,
    getTileSpeed
  }
})
