import { Position } from './Position'
import type { IMapMetaData } from './interfaces/IMap'
import { Entity } from '../ecs/entities/Entity'

/**
 * Classe représentant une carte du jeu
 * Contient les données de la carte (tuiles) et les entités présentes
 */
export class GameMap {
  /** Métadonnées de la carte */
  mapMetaData: IMapMetaData | null = null

  /** Données de la carte (tableau 2D d'indices de tuiles) */
  mapData: number[][] = []

  /** Largeur de la carte */
  width: number = 0

  /** Hauteur de la carte */
  height: number = 0

  /** Entités présentes sur cette carte */
  private _entitiesOnMap: Array<Entity> = []

  constructor(mapMetaData: IMapMetaData, mapRawData: number[][]) {
    this._convertRawDataToMapData(mapRawData)
    this.mapMetaData = mapMetaData
    this.width = mapRawData.length > 0 && mapRawData[0] ? mapRawData[0].length : 0
    this.height = mapRawData.length
  }

  /**
   * Convertit les données brutes de la carte en structure interne
   * @param rawData Données brutes de la carte
   */
  private _convertRawDataToMapData(rawData: number[][]): void {
    let rowIndex = 0
    let colIndex = 0

    for (const rows of rawData) {
      this.mapData[rowIndex] = []
      for (const cols of rows) {
        if (this.mapData[rowIndex]) {
          this.mapData[rowIndex]![colIndex] = cols
        }
        colIndex++
      }
      colIndex = 0
      rowIndex++
    }
  }

  /**
   * @returns Largeur maximum de la carte (index max)
   */
  getWidthMap(): number {
    return this.width - 1
  }

  /**
   * @returns Hauteur maximum de la carte (index max)
   */
  getHeightMap(): number {
    return this.height - 1
  }

  /**
   * Récupère l'index de la tuile à une position donnée
   * @param position Position sur la carte
   * @returns Index de la tuile
   */
  getTileIndexAtPosition(position: Position): number {
    const row = this.mapData[position.row]
    if (!row || row[position.col] === undefined) {
      return 0
    }
    return row[position.col]!
  }

  /**
   * Définit les entités présentes sur cette carte
   * @param entities Liste des entités
   */
  setEntitiesOnMap(entities: Array<Entity>): void {
    this._entitiesOnMap = entities
  }

  /**
   * @returns Liste des entités sur cette carte
   */
  getEntitiesOnMap(): Array<Entity> {
    return this._entitiesOnMap
  }

  /**
   * Modifie l'index de la tuile à une position donnée
   * @param tileIndex Nouvel index de tuile
   * @param position Position sur la carte
   */
  setTileIndexAtPosition(tileIndex: number, position: Position): void {
    const row = this.mapData[position.row]
    if (row) {
      row[position.col] = tileIndex
    }
  }
}
