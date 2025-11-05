/**
 * Interface représentant une tuile du jeu
 */
export interface ITile {
  /** Nom de la tuile */
  name: string

  /** Règle associée à la tuile (water, grass, etc.) */
  rule: string

  /** ID unique de la tuile */
  id: number

  /** Nombre de frames d'animation (optionnel) */
  frames?: string

  /** Frame actuelle de l'animation */
  currentFrame: number

  /** Image HTML de la tuile */
  image: HTMLImageElement
}
