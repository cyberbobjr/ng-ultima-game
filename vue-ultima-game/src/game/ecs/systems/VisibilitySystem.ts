import { Position } from '@/game/models/Position'
import { useMapStore } from '@/stores/useMapStore'

/**
 * VisibilitySystem - Calcule le champ de vision (FOV) du joueur
 * Utilise l'algorithme de shadowcasting pour déterminer quelles tiles sont visibles
 * Les tiles opaques (montagnes, forêts) bloquent la vision
 */
export class VisibilitySystem {
  private mapStore = useMapStore()
  private visiblePositions: Set<string> = new Set()

  /**
   * Calcule le champ de vision depuis une position donnée
   * @param center Position du joueur
   * @param radius Rayon de vision (en tiles)
   * @returns Set de positions visibles sous forme "row,col"
   */
  calculateFieldOfVision(center: Position, radius: number = 8): Set<string> {
    this.visiblePositions.clear()

    // La position centrale est toujours visible
    this.visiblePositions.add(this.positionToKey(center))

    // Calculer la vision dans 8 octants (shadowcasting)
    for (let octant = 0; octant < 8; octant++) {
      this.castShadows(center, radius, octant)
    }

    return this.visiblePositions
  }

  /**
   * Shadowcasting pour un octant
   */
  private castShadows(center: Position, radius: number, octant: number): void {
    this.scanOctant(center, radius, octant, 1, 0.0, 1.0)
  }

  /**
   * Scan récursif d'un octant avec shadowcasting
   */
  private scanOctant(
    center: Position,
    radius: number,
    octant: number,
    row: number,
    startSlope: number,
    endSlope: number
  ): void {
    if (startSlope >= endSlope) return

    let nextStartSlope = startSlope
    let blocked = false

    for (let distance = row; distance <= radius && !blocked; distance++) {
      const deltaY = -distance

      for (let deltaX = Math.floor(deltaY * startSlope); deltaX <= Math.ceil(deltaY * endSlope); deltaX++) {
        const currentPos = this.transformOctant(center, deltaX, deltaY, octant)

        // Vérifier si la position est dans les limites
        if (this.mapStore.isPositionOutOfBounds(currentPos)) {
          continue
        }

        // Calculer la pente
        const leftSlope = (deltaX - 0.5) / (deltaY + 0.5)
        const rightSlope = (deltaX + 0.5) / (deltaY - 0.5)

        if (startSlope >= rightSlope) {
          continue
        } else if (endSlope <= leftSlope) {
          break
        }

        // La tile est visible
        this.visiblePositions.add(this.positionToKey(currentPos))

        // Vérifier si la tile bloque la vision
        const isOpaque = this.mapStore.isTileAtPositionIsOpaque(currentPos)

        if (blocked) {
          // On était déjà bloqué
          if (isOpaque) {
            nextStartSlope = rightSlope
            continue
          } else {
            blocked = false
            startSlope = nextStartSlope
          }
        } else {
          // Pas encore bloqué
          if (isOpaque && distance < radius) {
            blocked = true
            nextStartSlope = rightSlope

            // Scan récursif de la prochaine rangée
            this.scanOctant(center, radius, octant, distance + 1, startSlope, leftSlope)
          }
        }
      }
    }
  }

  /**
   * Transforme les coordonnées relatives en fonction de l'octant
   */
  private transformOctant(center: Position, dx: number, dy: number, octant: number): Position {
    let row: number
    let col: number

    switch (octant) {
      case 0:
        row = center.row + dy
        col = center.col - dx
        break
      case 1:
        row = center.row - dx
        col = center.col + dy
        break
      case 2:
        row = center.row - dx
        col = center.col - dy
        break
      case 3:
        row = center.row + dy
        col = center.col + dx
        break
      case 4:
        row = center.row - dy
        col = center.col + dx
        break
      case 5:
        row = center.row + dx
        col = center.col + dy
        break
      case 6:
        row = center.row + dx
        col = center.col - dy
        break
      case 7:
        row = center.row - dy
        col = center.col - dx
        break
      default:
        row = center.row
        col = center.col
    }

    return new Position(row, col, center.mapId)
  }

  /**
   * Convertit une position en clé string
   */
  private positionToKey(pos: Position): string {
    return `${pos.row},${pos.col}`
  }

  /**
   * Vérifie si une position est visible
   */
  isPositionVisible(pos: Position): boolean {
    return this.visiblePositions.has(this.positionToKey(pos))
  }

  /**
   * Récupère toutes les positions visibles
   */
  getVisiblePositions(): Set<string> {
    return this.visiblePositions
  }
}
