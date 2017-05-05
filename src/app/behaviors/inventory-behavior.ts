import {IBehavior} from "../interfaces/IBehavior";
import {Entity} from "../classes/entity";

export class InventoryBehavior implements IBehavior {
    name = "inventory";
    private _gold: number = 0;
    private _itemsToFactory: Array<{ name: string, qty: number }> = [];
    private _itemsEntity: Array<{ item: Entity, qty: number }> = [];

    constructor(startGold: number = 100) {
        this._gold = startGold;
    }

    get gold() {
        return this._gold;
    }

    set gold(amount) {
        this._gold = amount;
    }

    get itemsToBuild() {
        return this._itemsToFactory;
    }

    tick(PerformanceNow: number) {

    }

    factoryItem(itemName: string, qty: number = 1) {
        this._itemsToFactory.push({name: itemName, qty: qty});
    }

    addItemToInventory(item: Entity, qty: number) {
        this._itemsEntity.push({item: item, qty: qty});
    }

    clearItemsToBuild() {
        this._itemsToFactory = [];
    }
}
