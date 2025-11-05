/**
 * Interface pour tous les comportements (behaviors) attachés aux entités
 * Chaque behavior doit implémenter cette interface
 */
export interface IBehavior {
  /** Nom unique du behavior */
  name: string

  /** Méthode appelée à chaque tick du jeu */
  tick(performanceNow: number): any
}
