import {IBehavior} from "../interfaces/IBehavior";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "./movable-behavior";
import {Position} from "../classes/position";
import {PositionBehavior} from "./position-behavior";

const WANDER_MVT = 0;

export class AiMovementBehavior implements IBehavior {
    name = "aimovement";
    movementType: number = 0;
    actor: Entity = null;
    lastPerformanceNow: number = 0;

    constructor(actor: Entity, movemenType: number) {
        this.actor = actor;
        this.movementType = movemenType;
    }

    tick(PerformanceNow: number) {
        if (PerformanceNow - this.lastPerformanceNow > 1000) {
            if (this.actor.hasBehavior("movable") && this.actor.hasBehavior("position") && this.movementType === WANDER_MVT) {
                this._randomMove();
            }
            this.lastPerformanceNow = PerformanceNow;
        }
    }

    private _randomMove() {
        let movementBehavior = <MovableBehavior>this.actor.getBehavior("movable");
        let positionBehavior = <PositionBehavior>this.actor.getBehavior("position");
        movementBehavior.vector = new Position(this._random(-1, 1), this._random(-1, 1), positionBehavior.position.mapId);
    }

    private _random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
