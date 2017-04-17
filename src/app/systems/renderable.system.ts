import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {RenderableBehavior} from "../behaviors/renderable-behavior";
import {MapsService} from "../services/maps/maps.service";

@Injectable()
export class RenderableSystem {
    constructor(private _mapsService: MapsService) {
    }

    processTick() {
        this._mapsService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("renderable")) {
                    let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
                    renderableBehavior.tick();
                }
            });
    }
}
