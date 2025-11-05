import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Entity } from '@/game/ecs/entities/Entity'

/**
 * usePartyStore - Gère le groupe de joueurs
 * Remplace PartyService
 */
export const usePartyStore = defineStore('party', () => {
  // État
  const party = ref<Entity[]>([])

  // Computed
  const members = computed(() => party.value)
  const partySize = computed(() => party.value.length)
  const hasMembers = computed(() => party.value.length > 0)

  /**
   * Ajoute le leader au groupe
   * @param entityToAdd Entité à ajouter comme leader
   */
  function addLeader(entityToAdd: Entity): void {
    if (!party.value.includes(entityToAdd)) {
      party.value.push(entityToAdd)
    }
  }

  /**
   * Ajoute un membre au groupe
   * @param entityToAdd Entité à ajouter
   */
  function addMember(entityToAdd: Entity): void {
    if (!party.value.includes(entityToAdd)) {
      party.value.push(entityToAdd)
    }
  }

  /**
   * Retire un membre du groupe
   * @param entityToRemove Entité à retirer
   */
  function removeMember(entityToRemove: Entity): void {
    const index = party.value.indexOf(entityToRemove)
    if (index > -1) {
      party.value.splice(index, 1)
    }
  }

  /**
   * Vérifie si une entité fait partie du groupe
   * @param entity Entité à vérifier
   */
  function isMember(entity: Entity): boolean {
    return party.value.includes(entity)
  }

  /**
   * Efface tout le groupe
   */
  function clearParty(): void {
    party.value = []
  }

  /**
   * Récupère le leader du groupe (premier membre)
   */
  function getLeader(): Entity | null {
    return party.value.length > 0 ? (party.value[0] as Entity) : null
  }

  return {
    // État
    party,

    // Computed
    members,
    partySize,
    hasMembers,

    // Actions
    addLeader,
    addMember,
    removeMember,
    isMember,
    clearParty,
    getLeader
  }
})
