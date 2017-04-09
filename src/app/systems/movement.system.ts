import {Injectable} from "@angular/core";
import {EntitiesService} from "../services/entities/entities.service";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";

@Injectable()
export class MovementSystem {
    constructor(private _entities: EntitiesService) {
    }

    processMovementsBehavior() {
        let entities: Array<Entity> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("movable") && entity.hasBehavior("position")) {
                let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                positionBehavior.moveTo(movableBehavior.directionCol, movableBehavior.directionRow);
                movableBehavior.stay();
            }
        });
        return entities;
    }
}
