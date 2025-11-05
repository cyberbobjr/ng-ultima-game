import _ from 'lodash'
import { ref, type Ref } from 'vue'
import type { IBehavior } from '../../models/interfaces/IBehavior'
import type { INpc, ITalkTexts } from '../../models/interfaces/INpc'
import type { Entity } from '../entities/Entity'

const MAX_KEYWORDS = 2

/**
 * Ordre des questions dans le dialogue
 */
export enum QuestionsOrder {
  Name = 0,
  Pronoun = 1,
  Look = 2,
  Job = 3,
  Heal = 4,
  Keyword1 = 5,
  Keyword2 = 6,
  Answer1 = 7,
  Answer2 = 8,
  YesNoQuestion = 9,
  YesAnswer = 10,
  NoAnswer = 11
}

/**
 * TalkBehavior - Gère les conversations avec les NPCs
 */
export class TalkBehavior implements IBehavior {
  name = 'talk'

  /** Flag pour indiquer si la conversation doit s'arrêter (ref Vue pour réactivité) */
  stopConversationFlag: Ref<boolean> = ref(false)

  protected _talkTexts: ITalkTexts | null = null
  protected _talkTo: Entity | null = null
  protected _owner: Entity
  protected _npc: INpc | null = null
  protected _waitForAnswer: boolean = false
  protected _questionIndex: number | null = null

  constructor(owner: Entity, npc: INpc | null = null) {
    this._owner = owner
    if (npc) {
      this._talkTexts = npc.talks
    }
    this._npc = npc
  }

  tick(performanceNow: number): any {
    // Pas de logique de tick
  }

  /**
   * @returns L'entité avec laquelle on parle
   */
  get talkTo(): Entity | null {
    return this._talkTo
  }

  /**
   * @returns Description du NPC
   */
  get description(): string | Array<string> {
    return this._talkTexts ? `You meet ${this._talkTexts.look}` : ''
  }

  /**
   * @returns Message de salutation
   */
  get greetings(): string | Array<string> {
    return this._talkTexts
      ? `${this._talkTexts.pronoun} says : I am ${this._talkTexts.name}`
      : 'Hello!'
  }

  /**
   * @returns Message d'au revoir
   */
  get bye(): string | Array<string> {
    if (this._talkTexts && _.has(this._talkTexts, 'bye')) {
      return (this._talkTexts as any).bye
    }
    return this._talkTo ? `Bye ${this._talkTo.name}!` : 'Goodbye!'
  }

  /**
   * Parse l'entrée du joueur et retourne une réponse
   * @param inputText Texte entré par le joueur
   * @returns Réponse du NPC
   */
  parseInput(inputText: string): string | Array<string> {
    const lowerInputText = _.toLower(inputText)

    if (this._waitForAnswer) {
      return this._parseYesNoAnswer(lowerInputText)
    }

    const answer = this._checkInputForKeywordAndQuestion(lowerInputText)
    return answer ? answer : 'That I Cannot help thee with.'
  }

  /**
   * Vérifie si l'entrée correspond à un mot-clé ou une question
   */
  private _checkInputForKeywordAndQuestion(playerInput: string): string | Array<string> | null {
    let answer = this._parseKeyWord(playerInput)
    if (answer) {
      return answer
    }

    answer = this._parseQuestion(playerInput)
    if (answer) {
      return answer
    }

    return null
  }

  /**
   * Parse une question
   */
  private _parseQuestion(question: string): string | null {
    if (this._talkTexts && _.has(this._talkTexts, question)) {
      this._questionIndex = QuestionsOrder[question as keyof typeof QuestionsOrder]
      return (this._talkTexts as any)[question]
    }
    return null
  }

  /**
   * Parse un mot-clé
   */
  private _parseKeyWord(question: string): string | Array<string> | null {
    const answer = this._getAnswerForKeyword(question)

    if (answer && this._isYesNoQuestion(this._questionIndex)) {
      this._waitForAnswer = true
      return [answer, this._talkTexts!.yesnoquestion]
    }

    return answer
  }

  /**
   * Récupère la réponse pour un mot-clé donné
   */
  private _getAnswerForKeyword(keyword: string): string | null {
    if (!this._talkTexts) return null

    for (let i = 1; i <= MAX_KEYWORDS; i++) {
      const keywordTalk = _.trimEnd(
        _.toLower((this._talkTexts as any)[`keyword${i}`])
      )

      if (_.startsWith(_.trimEnd(keyword), keywordTalk)) {
        this._questionIndex = 4 + i // TODO: améliorer cette logique
        return (this._talkTexts as any)[`answer${i}`]
      }
    }

    return null
  }

  /**
   * Vérifie si la question est une question oui/non
   */
  private _isYesNoQuestion(questionIndex: number | null): boolean {
    return this._npc ? this._npc.flag === questionIndex : false
  }

  /**
   * Parse une réponse oui/non
   */
  private _parseYesNoAnswer(answer: string): string {
    switch (answer) {
      case 'yes':
        this._waitForAnswer = false
        return this._getYesAnswer()
      case 'no':
        this._waitForAnswer = false
        return this._getNoAnswer()
      default:
        return 'Yes or No !'
    }
  }

  /**
   * @returns Réponse pour "oui"
   */
  private _getYesAnswer(): string {
    return this._talkTexts ? this._talkTexts.yesanswer : 'Very well.'
  }

  /**
   * @returns Réponse pour "non"
   */
  private _getNoAnswer(): string {
    return this._talkTexts ? this._talkTexts.noanswer : 'As you wish.'
  }

  /**
   * Termine la conversation
   */
  protected _endConversation(): void {
    this.stopConversationFlag.value = true
  }

  /**
   * Démarre une conversation avec une entité
   * @param entity Entité avec laquelle parler
   */
  startConversationWith(entity: Entity): void {
    this._talkTo = entity
    this.stopConversationFlag.value = false
  }
}
