import type { IBehavior } from '../../models/interfaces/IBehavior'
import { Position } from '../../models/Position'
import type { ITile } from '../../models/interfaces/ITile'

/**
 * Classe Entity - Représente une entité du jeu (joueur, NPC, objet, etc.)
 * Utilise le pattern Entity-Component-System (ECS)
 * Les entités sont composées de behaviors (composants) qui définissent leurs capacités
 */
export class Entity {
  /** Nom de l'entité */
  name: string = ''

  /** ID unique de l'entité (pour la gestion avec Phaser) */
  id: string = ''

  /** Map des behaviors attachés à cette entité */
  private _behaviors: Map<string, IBehavior> = new Map()

  constructor(entityName?: string) {
    if (entityName) {
      this.name = entityName
    }
    // Générer un ID unique
    this.id = `entity_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  /**
   * Ajoute un behavior à l'entité
   * @param behavior Behavior à ajouter
   */
  addBehavior(behavior: IBehavior): void {
    this._behaviors.set(behavior.name, behavior)
  }

  /**
   * Retire un behavior de l'entité
   * @param behaviorName Nom du behavior à retirer
   * @returns true si le behavior a été retiré
   */
  removeBehavior(behaviorName: string): boolean {
    return this._behaviors.delete(behaviorName)
  }

  /**
   * Vérifie si l'entité possède un behavior spécifique
   * @param behaviorName Nom du behavior
   * @returns true si le behavior existe
   */
  hasBehavior(behaviorName: string): boolean {
    return this._behaviors.has(behaviorName)
  }

  /**
   * Récupère un behavior de l'entité
   * @param behaviorName Nom du behavior
   * @returns Le behavior ou undefined
   */
  getBehavior(behaviorName: string): IBehavior | undefined {
    return this._behaviors.get(behaviorName)
  }

  /**
   * Récupère la position de l'entité
   * @returns Position de l'entité
   * @throws Error si l'entité n'a pas de PositionBehavior
   */
  getPosition(): Position {
    const positionBehavior = this.getBehavior('position') as any
    if (!positionBehavior) {
      throw new Error(`Entity ${this.name} doesn't have position behavior`)
    }
    return positionBehavior.position
  }

  /**
   * Vérifie si l'entité a une tuile (est visible)
   * @returns true si l'entité a un RenderableBehavior
   */
  hasTile(): boolean {
    return this.hasBehavior('renderable')
  }

  /**
   * Récupère la tuile de l'entité pour le rendu
   * @returns Tuile de l'entité ou null
   */
  getEntityTile(): ITile | null {
    if (this.hasBehavior('renderable')) {
      return this._getRenderableTile()
    }
    return null
  }

  /**
   * Vérifie si l'entité peut afficher des informations
   * @returns true si l'entité a un DescriptionBehavior
   */
  get isDisplayInfo(): boolean {
    return this.hasBehavior('description')
  }

  /**
   * Vérifie si l'entité peut parler
   * @returns true si l'entité a un TalkBehavior ou VendorTalkBehavior
   */
  get canEntityTalk(): boolean {
    return this.hasBehavior('talk') || this.hasBehavior('vendortalk')
  }

  /**
   * Récupère la tuile depuis le RenderableBehavior
   * @returns Tuile de l'entité
   */
  private _getRenderableTile(): ITile | null {
    const renderableBehavior = this.getBehavior('renderable') as any
    if (renderableBehavior && typeof renderableBehavior.getTile === 'function') {
      return renderableBehavior.getTile()
    }
    return null
  }

  /**
   * Récupère tous les behaviors de l'entité
   * @returns Map de tous les behaviors
   */
  getAllBehaviors(): Map<string, IBehavior> {
    return this._behaviors
  }
}
