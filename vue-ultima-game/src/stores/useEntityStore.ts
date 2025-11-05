import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import _ from 'lodash'
import { Entity } from '@/game/ecs/entities/Entity'
import { Position } from '@/game/models/Position'
import type { PositionBehavior } from '@/game/ecs/behaviors/PositionBehavior'
import type { IMapMetaData } from '@/game/models/interfaces/IMap'
import type { INpc } from '@/game/models/interfaces/INpc'
import type { IVendorInfo } from '@/game/models/interfaces/IVendorInfo'
import type { IVendorItem } from '@/game/models/interfaces/IVendorItem'
import { TalkBehavior } from '@/game/ecs/behaviors/TalkBehavior'
import { VendorTalkBehavior } from '@/game/ecs/behaviors/VendorTalkBehavior'

/**
 * useEntityStore - Gère toutes les entités du jeu
 * Remplace EntitiesService
 */
export const useEntityStore = defineStore('entity', () => {
  // État
  const entitiesForAllMaps = ref<Map<number, Array<Entity>>>(new Map())
  const player = ref<Entity | null>(null)
  const vendors = ref<any>(null)

  // Computed
  const hasPlayer = computed(() => player.value !== null)

  /**
   * Initialise le store en chargeant les données des vendors
   */
  async function initialize(): Promise<void> {
    await _loadVendorFile()
  }

  /**
   * Ajoute une entité pour une carte spécifique
   * @param entity Entité à ajouter
   * @param mapId ID de la carte
   */
  function addEntityForMapId(entity: Entity, mapId: number): void {
    const entities = getEntitiesForMapId(mapId)
    entities.push(entity)
    entitiesForAllMaps.value.set(mapId, entities)
  }

  /**
   * Définit le joueur
   * @param playerEntity Entité du joueur
   */
  function addPlayer(playerEntity: Entity): void {
    player.value = playerEntity
  }

  /**
   * Récupère le joueur
   */
  function getPlayer(): Entity | null {
    return player.value as Entity | null
  }

  /**
   * Récupère toutes les entités pour une carte donnée
   * @param mapId ID de la carte
   */
  function getEntitiesForMapId(mapId: number): Entity[] {
    let entities = entitiesForAllMaps.value.get(Number(mapId))
    if (!entities) {
      entities = []
    }
    return entities as Entity[]
  }

  /**
   * Récupère toutes les entités à une position donnée (incluant le joueur)
   * @param position Position à vérifier
   */
  function getEntitiesAtPosition(position: Position): Entity[] {
    let entities = getEntitiesForMapId(position.mapId)

    // Ajouter le joueur à la liste
    if (player.value) {
      entities = _.concat(entities, player.value) as Entity[]
    }

    // Filtrer les entités à la position donnée
    return _.filter(entities, (entity: Entity) => {
      if (entity.hasBehavior('position')) {
        const positionBehavior = entity.getBehavior('position') as PositionBehavior
        return positionBehavior.position.isEqual(position)
      }
      return false
    })
  }

  /**
   * Récupère une entité spécifique à une position
   * @param position Position à vérifier
   */
  function getEntityAtPosition(position: Position): Entity | undefined {
    const entities = getEntitiesForMapId(position.mapId)
    return _.find(entities, (entity: Entity) => {
      return position.isEqual(entity.getPosition())
    })
  }

  /**
   * Charge le fichier de dialogues pour une carte
   * @param tlkFilename Nom du fichier de dialogues
   */
  async function _loadTlkFile(tlkFilename: string): Promise<INpc[]> {
    const response = await fetch(`/assets/npcs/${tlkFilename}`)
    const jsonValue = await response.json()
    return jsonValue as INpc[]
  }

  /**
   * Charge le fichier des vendors
   */
  async function _loadVendorFile(): Promise<void> {
    const response = await fetch('/assets/npcs/vendors.json')
    const jsonValue = await response.json()
    vendors.value = jsonValue
  }

  /**
   * Charge toutes les entités pour toutes les cartes
   * @param maps Liste des métadonnées de cartes
   * @param entityFactory Factory pour créer les entités
   */
  async function loadAllEntitiesForMaps(
    maps: Array<IMapMetaData>,
    entityFactory: any
  ): Promise<void> {
    const promises = _.map(maps, async (map: IMapMetaData) => {
      if (map.city) {
        const talks = await _loadTlkFile(map.city.tlkfname)
        _createNpcsFromTalks(talks, map, entityFactory)
      }
    })

    await Promise.all(promises)
  }

  /**
   * Crée les NPCs depuis les données de dialogues
   */
  function _createNpcsFromTalks(
    npcs: Array<INpc>,
    mapMetaData: IMapMetaData,
    entityFactory: any
  ): void {
    _.map(npcs, (npc: INpc) => {
      let name = ''
      const entityPosition = new Position(npc.y_pos1, npc.x_pos1, mapMetaData.id)

      if (!_.has(npc, 'talks')) {
        name = 'vendor'
      } else {
        name = npc.talks.name
      }

      // Créer le NPC via la factory
      const entity = entityFactory.createNpc(entityPosition, npc.tile1, name, npc.move)

      // Ajouter le behavior de conversation
      if (_.has(npc, 'talks') && _.size(npc.talks) > 0) {
        entity.addBehavior(new TalkBehavior(entity, npc))
      }

      // Ajouter le behavior de vendor si c'est un marchand
      if (_.has(npc, 'vendor')) {
        const vendorInfo = _getVendorInfo(mapMetaData.city!.name, (npc as any).vendor)
        if (vendorInfo) {
          entity.addBehavior(new VendorTalkBehavior(entity, npc, vendorInfo))
        }
      }

      addEntityForMapId(entity, mapMetaData.id)
    })
  }

  /**
   * Récupère les informations d'un vendor
   */
  function _getVendorInfo(mapName: string, vendorType: string): IVendorInfo | null {
    let vendorForMap: IVendorInfo | null = null

    const allVendorsForType = _.find(vendors.value, { id: vendorType })

    if (allVendorsForType) {
      vendorForMap = _.find(allVendorsForType.vendor, { id: mapName })

      if (vendorForMap) {
        vendorForMap.inventory = (vendorForMap as any)[allVendorsForType.noun] as Array<IVendorItem>
        vendorForMap.tellAbout = allVendorsForType.tell_about
      }
    }

    return vendorForMap
  }

  /**
   * Efface toutes les entités (utile pour reset)
   */
  function clearAllEntities(): void {
    entitiesForAllMaps.value.clear()
  }

  return {
    // État
    entitiesForAllMaps,
    player,

    // Computed
    hasPlayer,

    // Actions
    initialize,
    addEntityForMapId,
    addPlayer,
    getPlayer,
    getEntitiesForMapId,
    getEntitiesAtPosition,
    getEntityAtPosition,
    loadAllEntitiesForMaps,
    clearAllEntities
  }
})
