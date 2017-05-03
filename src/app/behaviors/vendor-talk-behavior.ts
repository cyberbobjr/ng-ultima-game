import {INpc} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import {IVendorInfo} from "../interfaces/IVendorInfo";
import {TalkBehavior} from "./talk-behavior";
import * as _ from "lodash";
import {IVendorItem} from "../interfaces/IVendorItem";
import {InventoryBehavior} from "./inventory-behavior";

enum talkStatus {
    start = 0,
    wait_for_buy_or_sell,
    wait_for_item_buying_choice,
    wait_for_item_selling_choice,
    wait_for_take_it
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
                answer = this._parseBuyItemChoice(lowerInputText);
                break;
            case talkStatus.wait_for_take_it:
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
        let gold: number = this._getEntityGold();
        switch (this._howManyItemCanAfford(item, gold)) {
            case 0 :
                throw new Error("You have not the funds for even one!");
            case 1 :
                answer = [this._getItemAboutInformation(item)];
                answer.push("Take it?");
                this._itemTransaction = item;
                this._talkStatut = talkStatus.wait_for_take_it;
                break;
            default :
                return this._getItemAboutInformation(item);
        }
        return answer;
    }

    private _getEntityGold(): number {
        let inventoryBehavior: InventoryBehavior = <InventoryBehavior>this._talkTo.getBehavior("inventory");
        return inventoryBehavior ? inventoryBehavior.gold : 0;
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

    private _getItemAboutInformation(item: IVendorItem): string {
        let tellAbout = _.find(this._vendorInfo.tellAbout, {choice: item.choice});
        return _.replace(tellAbout.text, "{price}", item.price);
    }
}
