import type { IVendorItem } from './IVendorItem'

/**
 * Interface représentant les informations d'un marchand
 */
export interface IVendorInfo {
  /** ID unique du marchand */
  id: string

  /** Nom du marchand */
  name: string

  /** Propriétaire du commerce */
  owner: string

  /** Inventaire du marchand */
  inventory: Array<IVendorItem>

  /** Informations que le marchand peut donner */
  tellAbout: Array<{ choice: string; text: string }>
}
