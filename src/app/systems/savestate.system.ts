import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {PositionBehavior} from "../behaviors/position-behavior";
import {SavestateBehavior} from "../behaviors/savestate-behavior";
import {MapsService} from "../services/maps/maps.service";

@Injectable()
export class SavestateSystem {
    constructor(private _mapsService: MapsService) {
    }

    processTick() {
        this._mapsService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("savestate") && entity.hasBehavior("position")) {
                    let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                    let savestateBehavior = <SavestateBehavior>entity.getBehavior("savestate");
                    savestateBehavior.storeKeyValue("position", positionBehavior.position);
                }
            });
    }
}
