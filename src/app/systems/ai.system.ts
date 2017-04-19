import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {MapsService} from "../services/maps/maps.service";
import {AiMovementBehavior} from "../behaviors/ai-movement-behavior";

@Injectable()
export class AiSystem {
    constructor(private _mapService: MapsService) {
    }

    processAiBehavior() {
        this._mapService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("aimovement") && entity.hasBehavior("movable")) {
                    this._processAiEntityMovements(entity);
                }
            });
    }

    private _processAiEntityMovements(entity: Entity) {
        let AiMovementBehavior = <AiMovementBehavior>entity.getBehavior("aimovement");
        AiMovementBehavior.tick(performance.now());
    }
}