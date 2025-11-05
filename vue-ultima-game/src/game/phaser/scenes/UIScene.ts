import Phaser from 'phaser'
import { watch } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { usePartyStore } from '@/stores/usePartyStore'
import { useTalkingStore } from '@/stores/useTalkingStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

/**
 * UIScene - Scène d'interface utilisateur (overlay)
 * Affiche les informations, la conversation, les stats, etc.
 */
export class UIScene extends Phaser.Scene {
  // Stores Pinia
  private uiStore = useUIStore()
  private partyStore = usePartyStore()
  private talkingStore = useTalkingStore()
  private playerStore = usePlayerStore()

  // UI Elements
  private infoContainer!: Phaser.GameObjects.Container
  private infoTexts: Phaser.GameObjects.Text[] = []
  private conversationContainer!: Phaser.GameObjects.Container
  private conversationText!: Phaser.GameObjects.Text
  private statsContainer!: Phaser.GameObjects.Container
  private statsText!: Phaser.GameObjects.Text

  // Watchers Vue (pour nettoyer lors du shutdown)
  private stopWatchers: Array<() => void> = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    console.log('UIScene: Creating...')

    // Créer les conteneurs UI
    this.createInfoPanel()
    this.createConversationPanel()
    this.createStatsPanel()

    // Configurer les watchers Vue pour la réactivité
    this.setupReactiveWatchers()

    console.log('UIScene: Ready!')
  }

  /**
   * Crée le panneau d'informations (en bas de l'écran)
   */
  private createInfoPanel(): void {
    const { width, height } = this.cameras.main

    this.infoContainer = this.add.container(10, height - 100)

    // Fond semi-transparent
    const background = this.add.graphics()
    background.fillStyle(0x000000, 0.7)
    background.fillRect(0, 0, width - 20, 90)
    this.infoContainer.add(background)

    // Créer les textes d'information (5 lignes max)
    for (let i = 0; i < 5; i++) {
      const text = this.add.text(10, 10 + i * 16, '', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace'
      })
      this.infoTexts.push(text)
      this.infoContainer.add(text)
    }
  }

  /**
   * Crée le panneau de conversation (centre de l'écran)
   */
  private createConversationPanel(): void {
    const { width, height } = this.cameras.main

    this.conversationContainer = this.add.container(width / 2, height / 2)
    this.conversationContainer.setVisible(false)

    // Fond semi-transparent
    const background = this.add.graphics()
    background.fillStyle(0x000000, 0.9)
    background.fillRect(-200, -100, 400, 200)
    background.lineStyle(2, 0xffffff)
    background.strokeRect(-200, -100, 400, 200)
    this.conversationContainer.add(background)

    // Titre
    const title = this.add.text(0, -80, 'Conversation', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    })
    title.setOrigin(0.5)
    this.conversationContainer.add(title)

    // Texte de conversation
    this.conversationText = this.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 360 },
      align: 'center'
    })
    this.conversationText.setOrigin(0.5)
    this.conversationContainer.add(this.conversationText)

    // Instructions
    const instructions = this.add.text(0, 70, 'Press ESC to close', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'monospace'
    })
    instructions.setOrigin(0.5)
    this.conversationContainer.add(instructions)
  }

  /**
   * Crée le panneau de statistiques (coin supérieur droit)
   */
  private createStatsPanel(): void {
    const { width } = this.cameras.main

    this.statsContainer = this.add.container(width - 160, 10)

    // Fond semi-transparent
    const background = this.add.graphics()
    background.fillStyle(0x000000, 0.7)
    background.fillRect(0, 0, 150, 80)
    background.lineStyle(1, 0xffffff)
    background.strokeRect(0, 0, 150, 80)
    this.statsContainer.add(background)

    // Texte des stats
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    this.statsContainer.add(this.statsText)

    // Mettre à jour les stats initiales
    this.updateStatsDisplay()
  }

  /**
   * Configure les watchers Vue pour la réactivité avec les stores
   */
  private setupReactiveWatchers(): void {
    // Watcher pour les messages d'information
    const stopInfoWatcher = watch(
      () => this.uiStore.informationMessages,
      (messages) => {
        this.updateInfoDisplay(messages)
      },
      { immediate: true, deep: true }
    )
    this.stopWatchers.push(stopInfoWatcher)

    // Watcher pour l'état de conversation
    const stopConversationWatcher = watch(
      () => this.talkingStore.isConversationActive,
      (isActive) => {
        this.conversationContainer.setVisible(isActive)
        if (isActive && this.talkingStore.entityToTalk) {
          const entityName = this.talkingStore.entityToTalk.name
          this.conversationText.setText(`Talking with ${entityName}...`)
        }
      },
      { immediate: true }
    )
    this.stopWatchers.push(stopConversationWatcher)

    // Watcher pour les stats du joueur
    const stopStatsWatcher = watch(
      () => this.playerStore.hasPlayer,
      () => {
        this.updateStatsDisplay()
      },
      { immediate: true }
    )
    this.stopWatchers.push(stopStatsWatcher)

    // Watcher pour la taille du groupe
    const stopPartyWatcher = watch(
      () => this.partyStore.partySize,
      () => {
        this.updateStatsDisplay()
      },
      { immediate: true }
    )
    this.stopWatchers.push(stopPartyWatcher)
  }

  /**
   * Met à jour l'affichage des messages d'information
   */
  private updateInfoDisplay(messages: Array<{ text: string; color: string }>): void {
    // Afficher les 5 derniers messages
    const lastMessages = messages.slice(-5)

    for (let i = 0; i < this.infoTexts.length; i++) {
      const text = this.infoTexts[i]
      if (!text) continue

      if (i < lastMessages.length) {
        const message = lastMessages[i]
        if (message) {
          text.setText(message.text)
          text.setColor(message.color)
          text.setVisible(true)
        }
      } else {
        text.setVisible(false)
      }
    }
  }

  /**
   * Met à jour l'affichage des statistiques
   */
  private updateStatsDisplay(): void {
    const player = this.playerStore.getPlayer()

    if (!player) {
      this.statsText.setText('No player')
      return
    }

    // Récupérer les informations du joueur
    const position = player.getPosition()
    const partySize = this.partyStore.partySize

    // Construire le texte des stats
    let statsText = `Player: ${player.name}\n`
    statsText += `Pos: (${position.col}, ${position.row})\n`
    statsText += `Map: ${position.mapId}\n`

    if (partySize > 1) {
      statsText += `Party: ${partySize} members`
    }

    this.statsText.setText(statsText)
  }

  /**
   * Mise à jour de la scène (appelée chaque frame)
   */
  update(time: number, delta: number): void {
    // Mettre à jour périodiquement les stats
    // (pour afficher les changements de position en temps réel)
    if (time % 500 < delta) {
      // Toutes les 500ms environ
      this.updateStatsDisplay()
    }
  }

  /**
   * Nettoie la scène lors de la fermeture
   */
  shutdown(): void {
    console.log('UIScene: Shutting down...')

    // Arrêter tous les watchers Vue
    for (const stopWatcher of this.stopWatchers) {
      stopWatcher()
    }
    this.stopWatchers = []
  }
}
