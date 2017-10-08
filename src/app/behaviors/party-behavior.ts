import {IBehavior} from "../interfaces/IBehavior";
import {PartyService} from "../services/party/party.service";
import {Entity} from "../classes/entity";
import {InventoryBehavior} from "./inventory-behavior";

export class PartyBehavior implements IBehavior {
    name = "party";

    constructor(private _entityLeader: Entity, private _partyService: PartyService) {
        this._partyService.addMember(this._entityLeader);
    }

    tick(PerformanceNow: number) {

    }

    get partyGold(): number {
        let goldTotal: number = 0;
        for (let entity of this._partyService.members) {
            goldTotal += this._getGoldEntity(entity);
        }
        return goldTotal;
    }

    private _getGoldEntity(entity: Entity): number {
        return (entity.hasBehavior("inventory")) ? (<InventoryBehavior>entity.getBehavior("inventory")).gold : 0;
    }

    removeGold(amount: number) {
        let remaining: number = amount;
        for (let entity of this._partyService.members) {
            remaining = this._removeGoldForEntity(entity, remaining);
        }
    }

    private _removeGoldForEntity(entity: Entity, amount: number) {
        let remaining: number = 0;
        if (entity.hasBehavior("inventory")) {
            let entityInventory: InventoryBehavior = <InventoryBehavior>entity.getBehavior("inventory");
            if (entityInventory.gold <= amount) {
                remaining = amount - entityInventory.gold;
                entityInventory.gold = 0;
            } else {
                entityInventory.gold -= amount;
            }
        }
        return remaining;
    }
}

