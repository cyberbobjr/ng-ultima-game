import {INpc} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import {IVendorInfo} from "../interfaces/IVendorInfo";
import {TalkBehavior} from "./talk-behavior";
import * as _ from "lodash";
import {IVendorItem} from "../interfaces/IVendorItem";
import {InventoryBehavior} from "./inventory-behavior";
import {PartyBehavior} from "./party-behavior";

enum talkStatus {
    start = 0,
    wait_for_buy_or_sell,
    wait_for_item_buying_choice,
    wait_for_item_selling_choice,
    wait_for_take_it,
    wait_how_many_to_buy,
    wait_for_anything_else
}

export class VendorTalkBehavior extends TalkBehavior {
    name = "talk";
    private _vendorInfo: IVendorInfo = null;
    private _talkStatut: talkStatus = talkStatus.start;
    private _itemTransaction: IVendorItem;

    constructor(owner: Entity, npc: INpc = null, vendorInfo: IVendorInfo) {
        super(owner, npc);
        this._vendorInfo = vendorInfo;
    }

    tick(PerformanceNow: number) {

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
            this._getBuyOrSellQuestion()
        ];
    }

    private _getBuyOrSellQuestion(): string {
        return `${this._vendorInfo.owner} says: Welcome friend! Art thou here to Buy or Sell?`;
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
                answer = this._parseBuyItemChoice(lowerInputText);
                break;
            case talkStatus.wait_for_take_it:
                answer = this._parseTakeIt(lowerInputText);
                break;
            case talkStatus.wait_how_many_to_buy:
                answer = this._parseHowManyToBuy(lowerInputText);
                break;
            case talkStatus.wait_for_anything_else:
                answer = this._parseAnythingElse(lowerInputText);
                break;
        }
        return answer;
    }

    private _parseBuySellAnswer(inputText: string): string | Array<string> {
        switch (inputText[0]) {
            case "b":
                this._talkStatut = talkStatus.wait_for_item_buying_choice;
                return this._displayChoiceInventory();
            case "s" :
                return "Excellent! Which wouldst";
            default :
                this._endConversation();
                this._talkStatut = talkStatus.wait_for_buy_or_sell;
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

    private _parseBuyItemChoice(inputText: string): string | Array<string> {
        let answer: string | Array<string>;
        try {
            let itemToBuy: IVendorItem = this._getItemByChoice(inputText);
            answer = this._processBuyingItem(itemToBuy);
        } catch (err) {
            answer = err.message;
        }
        return answer;
    }

    private _processBuyingItem(item: IVendorItem): string | Array<string> {
        let answer: string | Array<string> = "";
        let gold: number = this._getEntityGold(this._talkTo);
        switch (this._howManyItemCanAfford(item, gold)) {
            case 0 :
                throw new Error("You have not the funds for even one!");
            case 1 :
                answer = [this._getInformationForItem(item)];
                answer.push("Take it?");
                this._itemTransaction = item;
                this._talkStatut = talkStatus.wait_for_take_it;
                break;
            default :
                answer = [this._getInformationForItem(item)];
                answer.push("How many would you like?");
                this._itemTransaction = item;
                this._talkStatut = talkStatus.wait_how_many_to_buy;
                break;
        }
        return answer;
    }

    private _getEntityGold(entity: Entity): number {
        return entity.hasBehavior("party") ?
               (<PartyBehavior>entity.getBehavior("party")).partyGold : (<InventoryBehavior>entity.getBehavior("inventory")).gold;
    }

    private _getItemByChoice(choice: string): IVendorItem {
        let item: IVendorItem = _.find(this._vendorInfo.inventory, {choice: choice});
        if (!item) {
            throw new Error("What ?");
        }
        return item;
    }

    private _howManyItemCanAfford(item: IVendorItem, playerGold: number): number {
        return Math.floor(playerGold / item.price);
    }

    private _getInformationForItem(item: IVendorItem): string {
        let tellAbout = _.find(this._vendorInfo.tellAbout, {choice: item.choice});
        return _.replace(tellAbout.text, "{price}", item.price);
    }

    private _parseTakeIt(inputText: string): string | Array<string> {
        switch (inputText[0]) {
            case "y":
                this._talkStatut = talkStatus.wait_for_anything_else;
                return [`${this._vendorInfo.name} says: A fine choice!`,
                        "Anything else?"];
            case "n" :
                this._talkStatut = talkStatus.wait_for_anything_else;
                return ["Too bad.",
                        "Anything else?"];
            default :
                return "Yes Or No !";
        }
    }

    private _parseHowManyToBuy(inputText: string): string | Array<string> {
        let input = parseInt(inputText, 10);
        if (!_.isNumber(input)) {
            return "What ?";
        }
        let totalAmount: number = this._itemTransaction.price * input;
        this._removeGoldToParty(totalAmount);
    }

    private _removeGoldToParty(totalAmount: number) {
        let partyBehavior: PartyBehavior = <PartyBehavior>this._talkTo.getBehavior("inventtory");
        partyBehavior.removeGold(totalAmount);
    }

    private _parseAnythingElse(inputText: string): string | Array<string> {
        switch (inputText[0]) {
            case "y" :
                this._talkStatut = talkStatus.wait_for_buy_or_sell;
                return this._getBuyOrSellQuestion();
            case "n":
                this._talkStatut = talkStatus.wait_for_buy_or_sell;
                this._endConversation();
                return this.bye;
            default :
                return "Yes Or No !";
        }
    }
}
