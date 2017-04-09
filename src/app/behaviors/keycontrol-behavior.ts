import {IBehavior} from "../interfaces/IBehavior";
import {Entity} from "../classes/entity";

export class KeycontrolBehavior implements IBehavior {
    name = "keycontrol";
    parent: Entity = null;

    constructor(entity: Entity) {
        this.parent = entity;
    }

    tick(): any {
        return null;
    }
}