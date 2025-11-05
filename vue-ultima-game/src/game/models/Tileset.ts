import _ from 'lodash'
import type { ITile } from './interfaces/ITile'
import type { ITileset } from './interfaces/ITileset'

/**
 * Classe représentant un ensemble de tuiles (tileset)
 * Gère l'indexation et le chargement des tuiles du jeu
 */
export class Tileset implements ITileset {
  /** Nom du tileset */
  name: string

  /** Collection de tuiles */
  tile: Array<ITile>

  /** Index interne pour un accès rapide aux tuiles par leur numéro */
  private _internalTilesIndices: Map<number, ITile> = new Map()

  constructor(name: string, tile: Array<ITile>) {
    this.name = name
    this.tile = tile
    this._buildTileIndex()
  }

  /**
   * Construit l'index interne des tuiles
   * Gère les tuiles avec plusieurs frames d'animation
   */
  private _buildTileIndex(): void {
    let currentIndex = 0

    _.map(this.tile, (tile: any) => {
      if (tile.frames) {
        // Tuile avec animation (plusieurs frames)
        const frameCounter = parseInt(tile.frames as string, 10)
        currentIndex = tile.id

        for (let i = 0; i < frameCounter; i++) {
          const cloneTile = _.clone(tile)
          cloneTile.currentFrame = i
          this._internalTilesIndices.set(currentIndex, cloneTile)
          currentIndex++
        }
      } else {
        // Tuile statique (une seule frame)
        tile.currentFrame = 0
        this._internalTilesIndices.set(currentIndex, tile)
        currentIndex++
      }
    })
  }

  /**
   * Définit l'image HTML pour une tuile spécifique
   * @param image Element image HTML
   * @param tileId ID de la tuile
   */
  setImageForTileById(image: HTMLImageElement, tileId: number): void {
    // Met à jour l'image dans l'index interne
    this._internalTilesIndices.forEach((tile: ITile) => {
      if (tile.id === tileId) {
        tile.image = image
      }
    })

    // Met à jour l'image dans le tableau de tuiles original
    _.map(this.tile, (tile) => {
      if (tile.id === tileId) {
        tile.image = image
      }
    })
  }

  /**
   * Récupère une tuile par son index
   * @param index Index de la tuile
   * @returns Tuile correspondante ou undefined
   */
  getTileAtIndex(index: number): ITile | undefined {
    return this._internalTilesIndices.get(index)
  }

  /**
   * Récupère l'index d'une tuile par son nom
   * @param name Nom de la tuile
   * @returns Index de la tuile
   * @throws Error si la tuile n'est pas trouvée
   */
  getTileIndexByName(name: string): number {
    let tileIndex: number | null = null

    this._internalTilesIndices.forEach((tile: ITile, keyIndex: number) => {
      if (tile.name === name) {
        tileIndex = keyIndex
      }
    })

    if (tileIndex === null) {
      throw new Error(`Tile ${name} not found`)
    }

    return tileIndex
  }
}
