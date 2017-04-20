import {IBehavior} from "../interfaces/IBehavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {ITile} from "../interfaces/ITile";
import {RenderableBehavior} from "../behaviors/renderable-behavior";
import {DescriptionsService} from "../services/descriptions/descriptions.service";
export enum talkingState {
    none = 1,
    askDirection,
    talking
}

export class Entity {
    name: string;
    talkingState: talkingState = talkingState.none;

    private _behaviors: Map<string, IBehavior> = new Map();

    constructor(entityName?: string) {
        if (entityName) {
            this.name = entityName;
        }
    }

    addBehavior(behavior: IBehavior) {
        this._behaviors.set(behavior.name, behavior);
    }

    removeBehavior(behaviorName: string) {
        return this._behaviors.delete(behaviorName);
    }

    hasBehavior(behaviorName: string): boolean {
        return this._behaviors.has(behaviorName);
    }

    getBehavior(behaviorName: string): IBehavior {
        return this._behaviors.get(behaviorName);
    }

    getPosition(): Position {
        let positionBehavior = <PositionBehavior>this.getBehavior("position");
        return positionBehavior.position;
    }

    hasTile(): boolean {
        return this.hasBehavior("renderable");
    }

    getEntityTile(): ITile {
        if (this.hasBehavior("renderable")) {
            return this._getRenderableTile();
        }
        return null;
    }

    get isDisplayInfo() {
        return this.hasBehavior("description");
    }

    private _getRenderableTile(): ITile {
        let renderableBehavior = <RenderableBehavior>this.getBehavior("renderable");
        return renderableBehavior.getTile();
    }
}
