/**
 * Interface représentant un portail entre deux cartes
 */
export interface IPortal {
  /** Position X du portail sur la carte source */
  x: string

  /** Position Y du portail sur la carte source */
  y: string

  /** ID de la carte de destination */
  destmapid: string

  /** Position X de départ sur la carte de destination */
  startx: string

  /** Position Y de départ sur la carte de destination */
  starty: string

  /** Action du portail */
  action: string

  /** Sauvegarde de la position */
  savelocation: string

  /** Type de transport */
  transport: string

  /** Message optionnel affiché lors du passage */
  message?: string
}
