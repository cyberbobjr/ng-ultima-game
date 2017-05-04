import {IBehavior} from "../interfaces/IBehavior";

export class InventoryBehavior implements IBehavior {
    name = "inventory";
    private _gold: number = 0;

    constructor(startGold: number = 100) {
        this._gold = startGold;
    }

    get gold() {
        return this._gold;
    }

    set gold(amount) {
        this._gold = amount;
    }

    tick(PerformanceNow: number) {

    }
}
