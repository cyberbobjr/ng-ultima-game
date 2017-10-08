import {IBehavior} from "../interfaces/IBehavior";
import {INpc, ITalkTexts} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import * as _ from "lodash";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
const MAX_KEYWORDS = 2;
export enum questionsOrder  {
    "name" = 0,
    "pronoun",
    "look",
    "job",
    "heal",
    "keyword1",
    "keyword2",
    "answer1",
    "answer2",
    "yesnoquestion",
    "yesanswer",
    "noanswer"
}

export class TalkBehavior implements IBehavior {
    name = "talk";
    stopConversationFlag$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    protected _talkTexts: ITalkTexts = null;
    protected _talkTo: Entity = null;
    protected _owner: Entity = null;
    protected _npc: INpc = null;
    protected _waitForAnswer: boolean = false;
    protected _questionIndex: number = null;

    constructor(owner: Entity, npc: INpc = null) {
        this._owner = owner;
        if (npc) {
            this._talkTexts = npc.talks;
        }
        this._npc = npc;
    }

    tick(PerformanceNow: number) {

    }

    get talkTo(): Entity {
        return this._talkTo;
    }

    get description(): string | Array<string> {
        return `You meet ${this._talkTexts.look}`;
    }

    get greetings(): string | Array<string> {
        return `${this._talkTexts.pronoun} says : I am ${this._talkTexts.name}`;
    }

    get bye(): string | Array<string> {
        return _.has(this._talkTexts, "bye") ? this._talkTexts["bye"] : `Bye ${this.talkTo.name}!`;
    }

    parseInput(inputText: string): string | Array<string> {
        let lowerInputText: string = _.toLower(inputText);
        let answer: string | Array<string>;
        answer = (this._waitForAnswer) ? this._parseYesNoAnswer(lowerInputText) : this._checkInputForKeywordAndQuestion(lowerInputText);
        return answer ? answer : "That I Cannot help thee with.";
    }

    private _parseYesNoAnswer(answer: string): string {
        switch (answer) {
            case "yes" :
                this._waitForAnswer = false;
                return this._getYesAnswer();
            case "no":
                this._waitForAnswer = false;
                return this._getNoAnswer();
            default :
                return "Yes or No !";
        }
    }

    private _checkInputForKeywordAndQuestion(playerInput: string): string | Array<string> {
        let answer: string | Array<string>;
        answer = this._parseKeyWord(playerInput);
        if (answer) {
            return answer;
        }
        answer = this._parseQuestion(playerInput);
        if (answer) {
            return answer;
        }
    }

    private _parseQuestion(question: string): string {
        if (_.has(this._talkTexts, question)) {
            this._questionIndex = questionsOrder[question];
            return this._talkTexts[question];
        }
        return null;
    }

    private _parseKeyWord(question: string): string | Array<string> {
        let answer: string = this._getAnswerForKeyword(question);
        if (answer && this._isYesNoQuestion(question)) {
            this._waitForAnswer = true;
            return [answer,
                    this._talkTexts["yesnoquestion"]];
        }
        return answer;
    }

    private _getAnswerForKeyword(keyword: string): string {
        let answer: string = null;
        for (let i = 1; i <= MAX_KEYWORDS; i++) {
            let keywordTalk = _.trimEnd(_.toLower(this._talkTexts["keyword" + i]));
            if (_.startsWith(_.trimEnd(keyword), keywordTalk)) {
                // @ TODO : bad bad bad
                this._questionIndex = 4 + i;
                return this._talkTexts["answer" + i];
            }
        }
        return null;
    }

    private _isYesNoQuestion(keyword: string): boolean {
        let questionIndex: number;
        for (let i = 1; i <= MAX_KEYWORDS; i++) {
            let keywordTalk = _.trimEnd(_.toLower(this._talkTexts["keyword" + i]));
            if (_.startsWith(_.trimEnd(keyword), keywordTalk)) {
                // @ TODO : bad bad bad
                questionIndex = 4 + i;
                if (this._npc.flag === questionIndex) {
                    return true;
                }
            }
        }
        return false;
    }

    private _getYesAnswer() {
        return this._talkTexts["yesanswer"];
    }

    private _getNoAnswer() {
        return this._talkTexts["noanswer"];
    }

    protected _endConversation() {
        this.stopConversationFlag$.next(true);
    }

    startConversationWith(entity: Entity) {
        this._talkTo = entity;
        this.stopConversationFlag$.next(false);
    }
}
