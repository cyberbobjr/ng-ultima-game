import {EntitiesService} from "../services/entities/entities.service";
import {Entity} from "../classes/entity";
import {Injectable} from "@angular/core";
import {MovableBehavior} from "../behaviors/movable-behavior";

@Injectable()
export class KeyboardinputSystem {

    constructor(private _entities: EntitiesService) {

    }

    processKeyboardInput(event: KeyboardEvent) {
        let entities: Array<Entity> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("keycontrol") && entity.hasBehavior("movable")) {
                let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
                switch (event.code) {
                    case "ArrowUp" :
                        movableBehavior.moveUp();
                        break;
                    case "ArrowDown":
                        movableBehavior.moveDown();
                        break;
                    case "ArrowLeft":
                        movableBehavior.moveLeft();
                        break;
                    case "ArrowRight":
                        movableBehavior.moveRight();
                        break;
                }
            }
        });
        return entities;
    }
}
