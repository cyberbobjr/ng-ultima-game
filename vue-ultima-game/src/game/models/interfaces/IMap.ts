/**
 * Métadonnées d'une carte du jeu
 */
export interface IMapMetaData {
  /** Nom du fichier de la carte */
  fname: string

  /** ID unique de la carte */
  id: number

  /** Comportement des bordures */
  borderbehavior: string

  /** ID de la musique */
  music: number

  /** Nom du tileset utilisé */
  tileset: string

  /** Base des tuiles */
  tilebase: string

  /** Nombre de niveaux */
  levels: number

  /** Largeur de la carte */
  width: number

  /** Hauteur de la carte */
  height: number

  /** Type de carte */
  type: string

  /** Informations sur la ville (si applicable) */
  city?: {
    personrole: Array<{
      role: string
      id: string
    }>
    name: string
    type: string
    tlkfname: string
  }
}
