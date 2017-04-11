import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {EntitiesService} from "../services/entities/entities.service";
import {PositionBehavior} from "../behaviors/position-behavior";
import {SavestateBehavior} from "../behaviors/savestate-behavior";

@Injectable()
export class SavestateSystem {
    constructor(private _entities: EntitiesService) {
    }

    processTick() {
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("savestate") && entity.hasBehavior("position")) {
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                let savestateBehavior = <SavestateBehavior>entity.getBehavior("savestate");
                savestateBehavior.storeKeyValue("position", positionBehavior.position);
            }
        });
    }
}
