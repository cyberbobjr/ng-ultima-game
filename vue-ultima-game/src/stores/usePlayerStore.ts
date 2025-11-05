import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Entity } from '@/game/ecs/entities/Entity'
import { Position } from '@/game/models/Position'
import { RenderableBehavior } from '@/game/ecs/behaviors/RenderableBehavior'
import { PositionBehavior } from '@/game/ecs/behaviors/PositionBehavior'
import { MovableBehavior } from '@/game/ecs/behaviors/MovableBehavior'
import { HealthBehavior } from '@/game/ecs/behaviors/HealthBehavior'
import { SavestateBehavior } from '@/game/ecs/behaviors/SavestateBehavior'
import { KeycontrolBehavior } from '@/game/ecs/behaviors/KeycontrolBehavior'
import { DescriptionBehavior } from '@/game/ecs/behaviors/DescriptionBehavior'
import { CollideBehavior } from '@/game/ecs/behaviors/CollideBehavior'
import { TravelcityBehavior } from '@/game/ecs/behaviors/TravelcityBehavior'
import { TalkBehavior } from '@/game/ecs/behaviors/TalkBehavior'
import { InventoryBehavior } from '@/game/ecs/behaviors/InventoryBehavior'
import { PartyBehavior } from '@/game/ecs/behaviors/PartyBehavior'
import { AiMovementBehavior } from '@/game/ecs/behaviors/AiMovementBehavior'
import type { ITile } from '@/game/models/interfaces/ITile'
import { useMapStore } from './useMapStore'
import { usePartyStore } from './usePartyStore'

/**
 * usePlayerStore - Gère la création et l'état du joueur et des NPCs
 * Remplace EntityFactoryService
 */
export const usePlayerStore = defineStore('player', () => {
  // État
  const player = ref<Entity | null>(null)

  // Computed
  const hasPlayer = computed(() => player.value !== null)
  const playerPosition = computed(() => {
    if (!player.value) return null
    return player.value.getPosition()
  })

  /**
   * Crée ou charge le joueur
   */
  async function createOrLoadPlayer(): Promise<Entity> {
    const mapStore = useMapStore()
    const partyStore = usePartyStore()

    // Créer l'entité joueur
    player.value = new Entity('Avatar')

    // Récupérer la tuile du joueur
    const avatarTile = mapStore.getTileByName('avatar')
    if (avatarTile) {
      player.value.addBehavior(new RenderableBehavior(avatarTile))
    }

    // Position du joueur (sauvegardée ou par défaut)
    const entityPosition = _getEntityPosition('player')
    player.value.addBehavior(new PositionBehavior(entityPosition))

    // Ajouter tous les behaviors du joueur
    player.value.addBehavior(new HealthBehavior(100))
    player.value.addBehavior(new MovableBehavior())
    player.value.addBehavior(new SavestateBehavior('player'))
    player.value.addBehavior(new KeycontrolBehavior())
    player.value.addBehavior(new DescriptionBehavior())
    player.value.addBehavior(new CollideBehavior())
    player.value.addBehavior(new TravelcityBehavior())
    player.value.addBehavior(new TalkBehavior(player.value as Entity))
    player.value.addBehavior(new InventoryBehavior())
    player.value.addBehavior(new PartyBehavior(player.value as Entity))

    return player.value as Entity
  }

  /**
   * Récupère la position du joueur (sauvegardée ou par défaut)
   */
  function _getEntityPosition(entityName: string): Position {
    const entityPosition = _getEntityPositionInStorage(entityName)

    if (!entityPosition) {
      // Position par défaut
      return new Position(104, 85, 0)
    } else {
      return new Position(entityPosition.row, entityPosition.col, entityPosition.mapId)
    }
  }

  /**
   * Récupère la position sauvegardée d'une entité
   */
  function _getEntityPositionInStorage(entityName: string): Position | null {
    const savestateBehavior = new SavestateBehavior(entityName)
    return savestateBehavior.loadKey('position')
  }

  /**
   * Crée un NPC
   * @param position Position du NPC
   * @param tileId ID de la tuile du NPC
   * @param name Nom du NPC
   * @param movementType Type de mouvement (0=fixe, 1=wander, etc.)
   */
  function createNpc(
    position: Position,
    tileId: number,
    name: string,
    movementType: number
  ): Entity {
    const mapStore = useMapStore()
    const newEntity = new Entity(name)

    // Récupérer la tuile du NPC
    const tile = mapStore.getTileByIndex(tileId)
    if (tile) {
      newEntity.addBehavior(new RenderableBehavior(tile))
    }

    // Ajouter les behaviors du NPC
    newEntity.addBehavior(new PositionBehavior(position))
    newEntity.addBehavior(new MovableBehavior())
    newEntity.addBehavior(new CollideBehavior())
    newEntity.addBehavior(new AiMovementBehavior(newEntity, movementType))

    return newEntity
  }

  /**
   * Récupère le joueur
   */
  function getPlayer(): Entity | null {
    return player.value as Entity | null
  }

  /**
   * Sauvegarde le joueur
   */
  function savePlayer(): void {
    if (!player.value) return

    const savestateBehavior = player.value.getBehavior('savestate') as SavestateBehavior
    const positionBehavior = player.value.getBehavior('position') as PositionBehavior

    if (savestateBehavior && positionBehavior) {
      savestateBehavior.storeKeyValue('position', positionBehavior.position)
    }
  }

  return {
    // État
    player,

    // Computed
    hasPlayer,
    playerPosition,

    // Actions
    createOrLoadPlayer,
    createNpc,
    getPlayer,
    savePlayer
  }
})
