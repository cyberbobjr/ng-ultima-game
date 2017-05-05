import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {EntityFactoryService} from "../services/entityFactory/entityFactory.service";
import {MapsService} from "../services/maps/maps.service";
import {InventoryBehavior} from "../behaviors/inventory-behavior";

@Injectable()
export class InventorySystem {
    constructor(private _entityFactory: EntityFactoryService,
                private _mapService: MapsService) {
    }

    processInventoryBehavior() {
        this._mapService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("inventory")) {
                    this._processFactoryItem(entity);
                }
            });
    }

    private _processFactoryItem(entity: Entity) {
        let inventoryBehavior: InventoryBehavior = <InventoryBehavior>entity.getBehavior("inventory");
        if (inventoryBehavior.itemsToBuild.length > 0) {
            this._buildItemAndAddToInventory(inventoryBehavior);
            inventoryBehavior.clearItemsToBuild();
            console.log(entity);
        }
    }

    private _buildItemAndAddToInventory(inventoryBehavior: InventoryBehavior) {
        for (let item of inventoryBehavior.itemsToBuild) {
            inventoryBehavior.addItemToInventory(this._entityFactory.createItem(item.name), item.qty);
        }
    }
}
