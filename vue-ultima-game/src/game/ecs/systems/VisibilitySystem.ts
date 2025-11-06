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

    // Marquer toutes les tiles dans le rayon comme visibles d'abord
    // Puis appliquer le shadowcasting pour bloquer les zones derrière les obstacles
    for (let row = -radius; row <= radius; row++) {
      for (let col = -radius; col <= radius; col++) {
        const distance = Math.sqrt(row * row + col * col)
        if (distance <= radius) {
          const pos = new Position(center.row + row, center.col + col, center.mapId)
          if (!this.mapStore.isPositionOutOfBounds(pos)) {
            this.visiblePositions.add(this.positionToKey(pos))
          }
        }
      }
    }

    // Maintenant appliquer le shadowcasting pour bloquer les zones derrière les obstacles
    for (let octant = 0; octant < 8; octant++) {
      this.castShadow(center, radius, octant)
    }

    // Log uniquement si activé en mode debug
    // console.log(`FOV: ${this.visiblePositions.size} tiles visibles (radius: ${radius})`)
    return this.visiblePositions
  }

  /**
   * Cast les ombres pour un octant spécifique
   */
  private castShadow(center: Position, radius: number, octant: number): void {
    const shadows: Array<{ start: number; end: number }> = []

    for (let distance = 1; distance <= radius; distance++) {
      for (let offset = -distance; offset <= distance; offset++) {
        const pos = this.transformOctant(center, offset, -distance, octant)

        if (this.mapStore.isPositionOutOfBounds(pos)) {
          continue
        }

        // Calculer l'angle de cette cellule
        const angle = Math.atan2(offset, distance)

        // Vérifier si cette cellule est dans une ombre
        let inShadow = false
        for (const shadow of shadows) {
          if (angle >= shadow.start && angle <= shadow.end) {
            inShadow = true
            break
          }
        }

        if (inShadow) {
          // Cette tile est dans l'ombre, la retirer
          this.visiblePositions.delete(this.positionToKey(pos))
        } else {
          // Vérifier si cette tile bloque la lumière
          if (this.mapStore.isTileAtPositionIsOpaque(pos)) {
            // Ajouter une ombre
            const angleSize = Math.atan2(0.5, distance)
            shadows.push({
              start: angle - angleSize,
              end: angle + angleSize
            })
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
        col = center.col + dx
        break
      case 1:
        row = center.row + dx
        col = center.col + dy
        break
      case 2:
        row = center.row + dx
        col = center.col - dy
        break
      case 3:
        row = center.row + dy
        col = center.col - dx
        break
      case 4:
        row = center.row - dy
        col = center.col - dx
        break
      case 5:
        row = center.row - dx
        col = center.col - dy
        break
      case 6:
        row = center.row - dx
        col = center.col + dy
        break
      case 7:
        row = center.row - dy
        col = center.col + dx
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
