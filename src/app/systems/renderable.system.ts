import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {EntitiesService} from "../services/entities/entities.service";
import {RenderableBehavior} from "../behaviors/renderable-behavior";

@Injectable()
export class RenderableSystem {
    constructor(private _entities: EntitiesService) {
    }

    processTick() {
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("renderable")) {
                let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
                renderableBehavior.tick();
            }
        });
    }
}
