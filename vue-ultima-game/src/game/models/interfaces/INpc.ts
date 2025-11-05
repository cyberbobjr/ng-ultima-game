/**
 * Textes de dialogue d'un NPC
 */
export interface ITalkTexts {
  answer1: string
  answer2: string
  heal: string
  job: string
  keyword1: string
  keyword2: string
  look: string
  name: string
  pronoun: string
  yesanswer: string
  noanswer: string
  yesnoquestion: string
}

/**
 * Interface représentant un NPC (Non-Player Character)
 */
export interface INpc {
  /** Flag du NPC */
  flag: number

  /** Valeur d'humilité */
  humility: number

  /** ID unique du NPC */
  id: number

  /** Type de mouvement (0=fixe, 1=wander, etc.) */
  move: number

  /** ID de la tuile/sprite */
  tile1: number

  /** ID du dialogue */
  tlk_id: number

  /** Se détourne après conversation */
  turningaway: number

  /** Position X initiale */
  x_pos1: number

  /** Position Y initiale */
  y_pos1: number

  /** Textes de dialogue */
  talks: ITalkTexts
}
