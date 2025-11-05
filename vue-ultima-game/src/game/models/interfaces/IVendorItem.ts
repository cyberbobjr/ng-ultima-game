/**
 * Interface représentant un objet vendu par un marchand
 */
export interface IVendorItem {
  /** Choix/code de l'objet */
  choice: string

  /** Nom de l'objet */
  name: string

  /** Prix de l'objet */
  price: number
}
