import {EntitiesService} from "../services/entities/entities.service";
import {Entity} from "../classes/entity";
import {Injectable} from "@angular/core";
import {MovableBehavior} from "../behaviors/movable-behavior";

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";

@Injectable()
export class KeyboardinputSystem {

    constructor(private _entities: EntitiesService ) {

    }

    processKeyboardInput(event: KeyboardEvent) {
        let entities: Array<Entity> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("keycontrol") && entity.hasBehavior("movable")) {
                let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
                switch (event.code) {
                    case KEY_UP :
                        movableBehavior.moveUp();
                        break;
                    case KEY_DOWN:
                        movableBehavior.moveDown();
                        break;
                    case KEY_LEFT:
                        movableBehavior.moveLeft();
                        break;
                    case KEY_RIGHT:
                        movableBehavior.moveRight();
                        break;
                }
            }
        });
        return entities;
    }
}
