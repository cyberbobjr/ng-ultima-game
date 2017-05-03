import {IBehavior} from "../interfaces/IBehavior";
import {INpc, ITalkTexts} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import {IVendorInfo} from "../interfaces/IVendorInfo";
import {TalkBehavior} from "./talk-behavior";
import * as _ from "lodash";
import {IVendorItem} from "../interfaces/IVendorItem";

enum talkStatus {
    start = 0,
    wait_for_buy_or_sell,
    wait_for_item_buying_choice,
    wait_for_item_selling_choice
}

export class VendorTalkBehavior extends TalkBehavior {
    name = "talk";
    private _vendorInfo: IVendorInfo = null;
    private _talkStatut: talkStatus = talkStatus.start;

    constructor(owner: Entity, npc: INpc = null, vendorInfo: IVendorInfo) {
        super(owner, npc);
        this._vendorInfo = vendorInfo;
    }

    tick(PerformanceNow: number) {

    }

    // @TODO : replace with behavior properties
    set talkTo(entity: Entity) {
        this._talkTo = entity;
    }

    get talkTo(): Entity {
        return this._talkTo;
    }

    get description(): string | Array<string> {
        return "";
    }

    get bye(): string | Array<string> {
        return `${this._vendorInfo.owner} says: Fare thee well!`;
    }

    get greetings(): string | Array<string> {
        this._talkStatut = talkStatus.wait_for_buy_or_sell;
        return [
            `Welcome to ${this._vendorInfo.name}!`,
            `${this._vendorInfo.owner} says: Welcome friend! Art thou here to Buy or Sell?`
        ];
    }

    parseInput(inputText: string): string | Array<string> {
        let lowerInputText: string = _.toLower(inputText);
        let answer: string | Array<string> = "";
        switch (this._talkStatut) {
            case talkStatus.start :
                break;
            case talkStatus.wait_for_buy_or_sell :
                answer = this._parseBuySellAnswer(lowerInputText);
                break;
            case talkStatus.wait_for_item_buying_choice :
                break;
        }
        return answer;
    }

    private _parseBuySellAnswer(answer: string): string | Array<string> {
        switch (answer[0]) {
            case "b":
                this._talkStatut = talkStatus.wait_for_item_buying_choice;
                return this._displayChoiceInventory();
            case "s" :
                return "Excellent! Which wouldst";
            default :
                this.stopConversationFlag$.next(true);
                return "Tu viendras me revoir quand tu sauras ce que tu veux !";
        }
    }

    private _displayChoiceInventory(): Array<string> {
        let answer: Array<string> = [];
        answer.push("Very Good! We Have:");
        answer = _.concat(answer, this._getInventoryToStringList());
        answer.push("Your Interest?");
        return answer;
    };

    private _getInventoryToStringList(): Array<string> {
        return _.map(this._vendorInfo.inventory, (item: IVendorItem) => {
            return `&nbsp;&nbsp;&nbsp;&nbsp;${item.choice} - ${item.name} - ${item.price}GP`;
        });
    }

    private _parseBuyItemChoice(answer: string): string | Array<string> {
        return "";
    }
}
