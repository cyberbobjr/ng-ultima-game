import {IBehavior} from "../interfaces/IBehavior";
import {INpc, ITalkTexts} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import * as _ from "lodash";
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
    private _talkTexts: ITalkTexts = null;
    private _talkTo: Entity = null;
    private _owner: Entity = null;
    private _npc: INpc = null;
    private _waitForAnswer: boolean = false;
    private _questionIndex: number = null;

    constructor(owner: Entity, npc: INpc = null) {
        this._owner = owner;
        if (npc) {
            this._talkTexts = npc.talks;
        }
        this._npc = npc;
    }

    tick(PerformanceNow: number) {

    }

    // @TODO : replace with behavior properties
    set talkTo(entity: Entity) {
        this._talkTo = entity;
    }

    get talkTo() {
        return this._talkTo;
    }

    get description() {
        return `You meet ${this._talkTexts.look}`;
    }

    get greetings() {
        return `${this._talkTexts.pronoun} says : I am ${this._talkTexts.name}`;
    }

    parseInput(inputText: string): string | Array<string> {
        let lowerInputText: string = _.toLower(inputText);
        if (this._waitForAnswer) {
            return this._parseYesNoAnswer(lowerInputText);
        }
        let answer: string | Array<string> = this._parseQuestion(lowerInputText);
        if (answer) {
            return answer;
        }
        answer = this._parseKeyWord(lowerInputText);
        if (answer) {
            return answer;
        }
        return "That I Cannot help thee with.";
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
        if (answer && this._isYesNoQuestion(this._questionIndex)) {
            this._waitForAnswer = true;
            return [answer,
                    this._talkTexts["yesnoquestion"]];
        }
        return answer;
    }

    private _getAnswerForKeyword(keyword: string): string {
        let answer: string = null;
        for (let i = 1; i <= MAX_KEYWORDS; i++) {
            let keywordTalk = _.toLower(this._talkTexts["keyword" + i]);
            if (_.startsWith(keyword, keywordTalk)) {
                // @ TODO : bad bad bad
                this._questionIndex = 4 + i;
                return this._talkTexts["answer" + i];
            }
        }
        return null;
    }

    private _isYesNoQuestion(questionIndex: number): boolean {
        return (this._npc.flag === questionIndex);
    }

    private _parseYesNoAnswer(answer: string): string {
        let result: string = null;
        switch (answer) {
            case "yes" :
                this._waitForAnswer = false;
                result = this._getYesAnswer();
                break;
            case "no":
                this._waitForAnswer = false;
                result = this._getNoAnswer();
                break;
            default :
                result = "Yes or No !";
                break;
        }
        return result;
    }

    private _getYesAnswer() {
        return this._talkTexts["yesanswer"];
    }

    private _getNoAnswer() {
        return this._talkTexts["noanswer"];
    }
}
