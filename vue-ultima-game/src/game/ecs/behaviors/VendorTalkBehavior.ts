import _ from 'lodash'
import type { INpc } from '../../models/interfaces/INpc'
import type { Entity } from '../entities/Entity'
import type { IVendorInfo } from '../../models/interfaces/IVendorInfo'
import type { IVendorItem } from '../../models/interfaces/IVendorItem'
import { TalkBehavior } from './TalkBehavior'
import type { InventoryBehavior } from './InventoryBehavior'
import type { PartyBehavior } from './PartyBehavior'

/**
 * Statuts de la conversation avec un marchand
 */
enum TalkStatus {
  Start = 0,
  WaitForBuyOrSell = 1,
  WaitForItemBuyingChoice = 2,
  WaitForItemSellingChoice = 3,
  WaitForTakeIt = 4,
  WaitHowManyToBuy = 5,
  WaitForAnythingElse = 6
}

/**
 * VendorTalkBehavior - Étend TalkBehavior pour les marchands
 * Gère les achats et ventes d'objets
 */
export class VendorTalkBehavior extends TalkBehavior {
  override name = 'vendortalk'

  private _vendorInfo: IVendorInfo
  private _talkStatus: TalkStatus = TalkStatus.Start
  private _itemTransaction?: IVendorItem

  constructor(owner: Entity, npc: INpc | null = null, vendorInfo: IVendorInfo) {
    super(owner, npc)
    this._vendorInfo = vendorInfo
  }

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }

  /**
   * @returns L'entité avec laquelle on parle
   */
  override get talkTo(): Entity | null {
    return this._talkTo
  }

  /**
   * @returns Description du marchand (vide pour les marchands)
   */
  override get description(): string | Array<string> {
    return ''
  }

  /**
   * @returns Message d'au revoir du marchand
   */
  override get bye(): string | Array<string> {
    return `${this._vendorInfo.owner} says: Fare thee well!`
  }

  /**
   * @returns Message de salutation du marchand
   */
  override get greetings(): string | Array<string> {
    this._talkStatus = TalkStatus.WaitForBuyOrSell
    return [`Welcome to ${this._vendorInfo.name}!`, this._getBuyOrSellQuestion()]
  }

  /**
   * @returns Question "Acheter ou vendre ?"
   */
  private _getBuyOrSellQuestion(): string {
    return `${this._vendorInfo.owner} says: Welcome friend! Art thou here to Buy or Sell?`
  }

  /**
   * Parse l'entrée du joueur selon le statut de la conversation
   * @param inputText Texte entré par le joueur
   * @returns Réponse du marchand
   */
  override parseInput(inputText: string): string | Array<string> {
    const lowerInputText = _.toLower(inputText)
    let answer: string | Array<string> = ''

    switch (this._talkStatus) {
      case TalkStatus.Start:
        break
      case TalkStatus.WaitForBuyOrSell:
        answer = this._parseBuySellAnswer(lowerInputText)
        break
      case TalkStatus.WaitForItemBuyingChoice:
        answer = this._parseBuyItemChoice(lowerInputText)
        break
      case TalkStatus.WaitForTakeIt:
        answer = this._parseTakeIt(lowerInputText)
        break
      case TalkStatus.WaitHowManyToBuy:
        answer = this._parseHowManyToBuy(lowerInputText)
        break
      case TalkStatus.WaitForAnythingElse:
        answer = this._parseAnythingElse(lowerInputText)
        break
    }

    return answer
  }

  /**
   * Parse la réponse "acheter" ou "vendre"
   */
  private _parseBuySellAnswer(inputText: string): string | Array<string> {
    switch (inputText[0]) {
      case 'b':
        this._talkStatus = TalkStatus.WaitForItemBuyingChoice
        return this._displayChoiceInventory()
      case 's':
        return 'Excellent! Which wouldst'
      default:
        this._endConversation()
        this._talkStatus = TalkStatus.WaitForBuyOrSell
        return 'Tu viendras me revoir quand tu sauras ce que tu veux !'
    }
  }

  /**
   * Affiche l'inventaire du marchand
   */
  private _displayChoiceInventory(): Array<string> {
    let answer: Array<string> = []
    answer.push('Very Good! We Have:')
    answer = _.concat(answer, this._getInventoryToStringList())
    answer.push('Your Interest?')
    return answer
  }

  /**
   * Convertit l'inventaire en liste de chaînes
   */
  private _getInventoryToStringList(): Array<string> {
    return _.map(this._vendorInfo.inventory, (item: IVendorItem) => {
      return `&nbsp;&nbsp;&nbsp;&nbsp;${item.choice} - ${item.name} - ${item.price}GP`
    })
  }

  /**
   * Parse le choix d'objet à acheter
   */
  private _parseBuyItemChoice(inputText: string): string | Array<string> {
    try {
      const itemToBuy = this._getItemByChoice(inputText)
      return this._processBuyingItem(itemToBuy)
    } catch (err: any) {
      return err.message
    }
  }

  /**
   * Traite l'achat d'un objet
   */
  private _processBuyingItem(item: IVendorItem): string | Array<string> {
    const gold = this._getEntityGold(this._talkTo!)

    switch (this._howManyItemCanAfford(item, gold)) {
      case 0:
        throw new Error('You have not the funds for even one!')
      case 1:
        this._itemTransaction = item
        this._talkStatus = TalkStatus.WaitForTakeIt
        return [this._getInformationForItem(item), 'Take it?']
      default:
        this._itemTransaction = item
        this._talkStatus = TalkStatus.WaitHowManyToBuy
        return [this._getInformationForItem(item), 'How many would you like?']
    }
  }

  /**
   * Récupère l'or d'une entité (party ou inventaire)
   */
  private _getEntityGold(entity: Entity): number {
    if (entity.hasBehavior('party')) {
      const partyBehavior = entity.getBehavior('party') as PartyBehavior
      return partyBehavior.partyGold
    } else if (entity.hasBehavior('inventory')) {
      const inventoryBehavior = entity.getBehavior('inventory') as InventoryBehavior
      return inventoryBehavior.gold
    }
    return 0
  }

  /**
   * Récupère un objet par son choix (lettre)
   */
  private _getItemByChoice(choice: string): IVendorItem {
    const item = _.find(this._vendorInfo.inventory, { choice })
    if (!item) {
      throw new Error('What ?')
    }
    return item
  }

  /**
   * Calcule combien d'objets le joueur peut acheter
   */
  private _howManyItemCanAfford(item: IVendorItem, playerGold: number): number {
    return Math.floor(playerGold / item.price)
  }

  /**
   * Récupère les informations textuelles sur un objet
   */
  private _getInformationForItem(item: IVendorItem): string {
    const tellAbout = _.find(this._vendorInfo.tellAbout, { choice: item.choice })
    if (!tellAbout) {
      return `${item.name} - ${item.price}GP`
    }
    return _.replace(tellAbout.text, '{price}', item.price.toString())
  }

  /**
   * Parse la réponse "Prendre cet objet ?"
   */
  private _parseTakeIt(inputText: string): string | Array<string> {
    switch (inputText[0]) {
      case 'y':
        this._talkStatus = TalkStatus.WaitForAnythingElse
        return [`${this._vendorInfo.owner} says: A fine choice!`, 'Anything else?']
      case 'n':
        this._talkStatus = TalkStatus.WaitForAnythingElse
        return ['Too bad.', 'Anything else?']
      default:
        return 'Yes Or No !'
    }
  }

  /**
   * Parse la quantité à acheter
   */
  private _parseHowManyToBuy(inputText: string): string | Array<string> {
    const input = parseInt(inputText, 10)

    if (!_.isNumber(input) || isNaN(input)) {
      return 'What ?'
    }

    const totalAmount = this._itemTransaction!.price * input
    this._talkStatus = TalkStatus.WaitForAnythingElse

    if (totalAmount > this._getEntityGold(this._talkTo!)) {
      return [
        'I fear you have not the funds, perhaps something else.',
        'Anything else?'
      ]
    } else {
      this._removeGoldToParty(totalAmount)
      return [`${this._vendorInfo.owner} says: A fine choice!`, 'Anything else?']
    }
  }

  /**
   * Retire l'or du groupe
   */
  private _removeGoldToParty(totalAmount: number): void {
    if (this._talkTo && this._talkTo.hasBehavior('party')) {
      const partyBehavior = this._talkTo.getBehavior('party') as PartyBehavior
      partyBehavior.removeGold(totalAmount)
    }
  }

  /**
   * Parse la réponse "Autre chose ?"
   */
  private _parseAnythingElse(inputText: string): string | Array<string> {
    switch (inputText[0]) {
      case 'y':
        this._talkStatus = TalkStatus.WaitForBuyOrSell
        return this._getBuyOrSellQuestion()
      case 'n':
        this._talkStatus = TalkStatus.WaitForBuyOrSell
        this._endConversation()
        return this.bye
      default:
        return 'Yes Or No !'
    }
  }
}
