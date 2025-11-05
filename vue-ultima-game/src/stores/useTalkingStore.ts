import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import _ from 'lodash'
import { Entity } from '@/game/ecs/entities/Entity'
import type { TalkBehavior } from '@/game/ecs/behaviors/TalkBehavior'
import type { AiMovementBehavior } from '@/game/ecs/behaviors/AiMovementBehavior'
import { useUIStore } from './useUIStore'

/**
 * useTalkingStore - Gère les conversations avec les NPCs
 * Remplace TalkingService
 */
export const useTalkingStore = defineStore('talking', () => {
  // État
  const talker = ref<Entity | null>(null)
  const entityToTalk = ref<Entity | null>(null)
  const talkerToBehavior = ref<TalkBehavior | null>(null)
  const isConversationActive = computed(() => talker.value !== null)

  /**
   * Démarre une nouvelle conversation
   * @param entity Entité qui initie la conversation (le joueur)
   * @param targetEntity Entité avec laquelle parler (le NPC)
   */
  function startNewConversation(entity: Entity, targetEntity: Entity): void {
    talker.value = entity
    entityToTalk.value = targetEntity

    _loadTalkWith(entity)
    _stopAiMovementForEntity(targetEntity)
    _displayGreetings()
    _subscribeToEndConversation()
  }

  /**
   * Charge le behavior de conversation
   */
  function _loadTalkWith(entity: Entity): void {
    if (entityToTalk.value) {
      const talkBehavior = entityToTalk.value.getBehavior('talk') as TalkBehavior
      if (!talkBehavior) {
        const vendorTalkBehavior = entityToTalk.value.getBehavior('vendortalk') as TalkBehavior
        talkerToBehavior.value = vendorTalkBehavior
      } else {
        talkerToBehavior.value = talkBehavior
      }

      if (talkerToBehavior.value) {
        talkerToBehavior.value.startConversationWith(entity)
      }
    }
  }

  /**
   * Parse l'entrée du joueur pendant une conversation
   * @param conversation Texte entré par le joueur
   * @returns Réponse du NPC
   */
  function parseInputTalking(conversation: string): string | Array<string> {
    if (!talkerToBehavior.value) {
      return 'No conversation active'
    }

    if (_.toLower(conversation) === 'bye') {
      const byeMessage = talkerToBehavior.value.bye
      stopConversation()
      return byeMessage
    } else {
      return talkerToBehavior.value.parseInput(conversation)
    }
  }

  /**
   * Arrête le mouvement AI du NPC pendant la conversation
   */
  function _stopAiMovementForEntity(targetEntity: Entity): void {
    const aiMovementBehavior = targetEntity.getBehavior('aimovement') as AiMovementBehavior
    if (aiMovementBehavior) {
      aiMovementBehavior.stopAiMovement()
    }
  }

  /**
   * Reprend le mouvement AI du NPC après la conversation
   */
  function _resumeAiMovementsForEntity(targetEntity: Entity): void {
    const aiMovementBehavior = targetEntity.getBehavior('aimovement') as AiMovementBehavior
    if (aiMovementBehavior) {
      aiMovementBehavior.resumeAiMovement()
    }
  }

  /**
   * Affiche les salutations du NPC
   */
  function _displayGreetings(): void {
    if (!entityToTalk.value) return

    const talkBehavior = (entityToTalk.value.getBehavior('talk') ||
      entityToTalk.value.getBehavior('vendortalk')) as TalkBehavior

    if (talkBehavior) {
      const uiStore = useUIStore()
      uiStore.addTextToInformation(talkBehavior.description)
      uiStore.addTextToInformation(talkBehavior.greetings)
    }
  }

  /**
   * Arrête la conversation en cours
   */
  function stopConversation(): void {
    if (entityToTalk.value) {
      _resumeAiMovementsForEntity(entityToTalk.value as Entity)
    }

    talker.value = null
    entityToTalk.value = null
    talkerToBehavior.value = null
  }

  /**
   * S'abonne au flag de fin de conversation du behavior
   */
  function _subscribeToEndConversation(): void {
    if (!talkerToBehavior.value) return

    // Utiliser watch de Vue pour surveiller le flag stopConversationFlag
    const behavior = talkerToBehavior.value
    const stopFlag = (behavior as any).stopConversationFlag

    if (stopFlag && typeof stopFlag === 'object' && 'value' in stopFlag) {
      // Le behavior utilise ref() de Vue, donc on peut le surveiller
      // Vérifier périodiquement (simplifié pour Phase 3)
      const interval = setInterval(() => {
        if (stopFlag.value) {
          stopConversation()
          clearInterval(interval)
        }
      }, 100)
    }
  }

  return {
    // État
    talker,
    entityToTalk,
    isConversationActive,

    // Actions
    startNewConversation,
    parseInputTalking,
    stopConversation
  }
})
