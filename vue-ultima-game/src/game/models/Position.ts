import _ from 'lodash'

/**
 * Classe représentant une position 2D dans le jeu
 * avec le numéro de carte (mapId)
 */
export class Position {
  /** ID de la carte */
  mapId: number = 0

  /** Ligne (coordonnée Y) */
  row: number

  /** Colonne (coordonnée X) */
  col: number

  constructor(row?: number, col?: number, mapId?: number) {
    this.col = col ?? 0
    this.row = row ?? 0
    if (mapId !== undefined) {
      this.mapId = mapId
    }
  }

  /**
   * Ajoute un vecteur à cette position
   * @param vector Vecteur de déplacement
   * @returns Nouvelle position résultante
   */
  addVector(vector: Position): Position {
    const resultPosition = new Position(this.row, this.col, this.mapId)

    if (vector.col !== undefined) {
      resultPosition.col += vector.col
    }
    if (vector.row !== undefined) {
      resultPosition.row += vector.row
    }

    return resultPosition
  }

  /**
   * Compare cette position avec une autre
   * @param positionToCompare Position à comparer
   * @returns true si les positions sont égales
   */
  isEqual(positionToCompare: Position): boolean {
    return (
      positionToCompare.row === this.row &&
      positionToCompare.col === this.col &&
      _.toInteger(positionToCompare.mapId) === _.toInteger(this.mapId)
    )
  }

  /**
   * @returns Vecteur de déplacement vers le haut
   */
  getVectorUp(): Position {
    return new Position(-1, 0, this.mapId)
  }

  /**
   * @returns Vecteur de déplacement vers le bas
   */
  getVectorDown(): Position {
    return new Position(1, 0, this.mapId)
  }

  /**
   * @returns Vecteur de déplacement vers la gauche
   */
  getVectorLeft(): Position {
    return new Position(0, -1, this.mapId)
  }

  /**
   * @returns Vecteur de déplacement vers la droite
   */
  getVectorRight(): Position {
    return new Position(0, +1, this.mapId)
  }
}
