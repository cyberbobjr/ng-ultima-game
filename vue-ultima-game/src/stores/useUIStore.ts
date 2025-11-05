import { defineStore } from 'pinia'
import { ref } from 'vue'
import _ from 'lodash'

/**
 * Interface pour un message d'information
 */
export interface InformationMessage {
  text: string
  color: string
  timestamp: number
}

/**
 * useUIStore - Gère l'état de l'interface utilisateur
 * Remplace DescriptionsService
 */
export const useUIStore = defineStore('ui', () => {
  // État
  const informationMessages = ref<InformationMessage[]>([])
  const maxMessages = ref(100) // Limiter le nombre de messages

  /**
   * Ajoute un texte d'information (peut être un string ou un tableau)
   * @param informationToDisplay Message(s) à afficher
   * @param color Couleur du message (défaut: white)
   */
  function addTextToInformation(
    informationToDisplay: string | Array<string>,
    color: string = 'white'
  ): void {
    if (_.isArray(informationToDisplay)) {
      _.map(informationToDisplay, (information: string) => {
        _addSingleMessage(information, color)
      })
    } else {
      _addSingleMessage(informationToDisplay as string, color)
    }
  }

  /**
   * Ajoute un message de log
   * @param logInformation Message de log
   * @param color Couleur du message (défaut: white)
   */
  function addLogInformation(logInformation: string, color: string = 'white'): void {
    _addSingleMessage(logInformation, color)
  }

  /**
   * Ajoute un seul message à la liste
   */
  function _addSingleMessage(text: string, color: string): void {
    informationMessages.value.push({
      text,
      color,
      timestamp: Date.now()
    })

    // Limiter le nombre de messages pour éviter les fuites mémoire
    if (informationMessages.value.length > maxMessages.value) {
      informationMessages.value.shift()
    }
  }

  /**
   * Efface tous les messages
   */
  function clearMessages(): void {
    informationMessages.value = []
  }

  /**
   * Récupère les N derniers messages
   * @param count Nombre de messages à récupérer
   */
  function getLastMessages(count: number): InformationMessage[] {
    return informationMessages.value.slice(-count)
  }

  return {
    // État
    informationMessages,
    maxMessages,

    // Actions
    addTextToInformation,
    addLogInformation,
    clearMessages,
    getLastMessages
  }
})
