import type { ITile } from './ITile'

/**
 * Interface pour un ensemble de tuiles (tileset)
 */
export interface ITileset {
  /** Nom du tileset */
  name: string

  /** Collection de tuiles */
  tile: Array<ITile>
}
