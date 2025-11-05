import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMapStore } from './useMapStore'
import { useEntityStore } from './useEntityStore'
import { usePlayerStore } from './usePlayerStore'
import type { Entity } from '@/game/ecs/entities/Entity'
import type { Position } from '@/game/models/Position'
import type { IPortal } from '@/game/models/interfaces/IPortal'

/**
 * useGameStore - Gère l'état global du jeu et l'initialisation
 * Remplace ConfigService et une partie de ScenegraphService
 */
export const useGameStore = defineStore('game', () => {
  // État
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const currentMapId = ref(0)
  const entityCenter = ref<Entity | null>(null)

  // Caméra/viewport
  const cameraPosition = ref<Position | null>(null)
  const maxVisiblesCols = ref(10)
  const maxVisiblesRows = ref(10)

  // Computed
  const isGameReady = computed(() => isInitialized.value && !isLoading.value)

  /**
   * Initialise le jeu en chargeant toutes les ressources
   */
  async function loadConfig(): Promise<void> {
    isLoading.value = true
    loadingMessage.value = 'Loading tiles...'

    try {
      const mapStore = useMapStore()
      const entityStore = useEntityStore()
      const playerStore = usePlayerStore()

      // 1. Charger les tuiles
      await mapStore.loadTiles()
      loadingMessage.value = 'Loading maps...'

      // 2. Charger toutes les métadonnées des cartes
      await mapStore.loadAllMaps()
      loadingMessage.value = 'Loading entities...'

      // 3. Initialiser le store d'entités
      await entityStore.initialize()

      // 4. Charger toutes les entités pour toutes les cartes
      const maps = mapStore.getAllMaps()
      await entityStore.loadAllEntitiesForMaps(maps, playerStore)

      loadingMessage.value = 'Game ready!'
      isInitialized.value = true
    } catch (error) {
      console.error('Error loading game config:', error)
      loadingMessage.value = 'Error loading game'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Définit l'entité sur laquelle centrer la caméra
   * @param entity Entité à centrer (généralement le joueur)
   */
  function setCenterCameraOnEntity(entity: Entity): void {
    if (entity.hasBehavior('position')) {
      entityCenter.value = entity
    } else {
      throw new Error("Entity doesn't have position behavior")
    }
  }

  /**
   * Définit la carte pour une entité
   * @param entity Entité à déplacer
   * @param newPosition Nouvelle position
   */
  async function setMapForEntity(entity: Entity, newPosition: Position): Promise<boolean> {
    const mapStore = useMapStore()

    try {
      // Charger la nouvelle carte
      await mapStore.loadMapByMapId(newPosition.mapId)

      // Mettre à jour la position de l'entité
      const positionBehavior = entity.getBehavior('position') as any
      if (positionBehavior) {
        positionBehavior.setNewPosition(newPosition)
      }

      currentMapId.value = newPosition.mapId
      return true
    } catch (error) {
      console.error('Error setting map for entity:', error)
      return false
    }
  }

  /**
   * Entre dans une ville
   * @param entity Entité qui entre
   * @param mapId ID de la carte de destination
   */
  async function enterInCity(entity: Entity, mapId: number): Promise<void> {
    const mapStore = useMapStore()

    const portalInformation = mapStore.getPortalInformationForMapId(mapId, 0)
    if (!portalInformation) {
      throw new Error(`No portal information found for map ${mapId}`)
    }

    const newPosition = mapStore.getPositionOfPortal(portalInformation)
    await setMapForEntity(entity, newPosition)
  }

  /**
   * Définit la position de la caméra
   * @param position Position de la caméra
   */
  function setCameraPosition(position: Position): void {
    cameraPosition.value = position
  }

  /**
   * Centre la caméra sur l'entité centrée
   */
  function centerCameraOnEntity(): void {
    if (!entityCenter.value) return

    const positionBehavior = entityCenter.value.getBehavior('position') as any
    if (positionBehavior) {
      setCameraPosition(positionBehavior.position)
    }
  }

  /**
   * Rafraîchit la vue (placeholder pour Phase 4 avec Phaser)
   * En Phase 4, cette logique sera gérée par Phaser
   */
  function refresh(): void {
    // TODO Phase 4: Sera géré par Phaser
    // Pour l'instant, on centre juste la caméra
    if (entityCenter.value) {
      centerCameraOnEntity()
    }
  }

  /**
   * Récupère la position actuelle de la caméra
   */
  function getCameraPosition(): Position | null {
    return cameraPosition.value
  }

  /**
   * Réinitialise le jeu
   */
  function resetGame(): void {
    isInitialized.value = false
    isLoading.value = false
    loadingMessage.value = ''
    currentMapId.value = 0
    entityCenter.value = null
    cameraPosition.value = null
  }

  return {
    // État
    isInitialized,
    isLoading,
    loadingMessage,
    currentMapId,
    entityCenter,
    cameraPosition,
    maxVisiblesCols,
    maxVisiblesRows,

    // Computed
    isGameReady,

    // Actions
    loadConfig,
    setCenterCameraOnEntity,
    setMapForEntity,
    enterInCity,
    setCameraPosition,
    centerCameraOnEntity,
    refresh,
    getCameraPosition,
    resetGame
  }
})
