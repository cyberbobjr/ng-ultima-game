import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {PositionBehavior} from "../behaviors/position-behavior";
import {SavestateBehavior} from "../behaviors/savestate-behavior";
import {MapsService} from "../services/maps/maps.service";
const TIMER_INTERVAL_SECONDS = 5000;

@Injectable()
export class SavestateSystem {
    lastPerformanceNow: number = 0;

    constructor(private _mapsService: MapsService) {
    }

    processTick() {
        let PerformanceNow: number = performance.now();
        if (PerformanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
            this._mapsService.getEntitiesOnCurrentMap()
                .forEach((entity: Entity) => {
                    if (entity.hasBehavior("savestate") && entity.hasBehavior("position")) {
                        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                        let savestateBehavior = <SavestateBehavior>entity.getBehavior("savestate");
                        savestateBehavior.storeKeyValue("position", positionBehavior.position);
                    }
                });
            this.lastPerformanceNow = PerformanceNow;
        }
    }
}
