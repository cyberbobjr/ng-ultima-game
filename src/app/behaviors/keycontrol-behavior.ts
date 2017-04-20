import {IBehavior} from "../interfaces/IBehavior";

export class KeycontrolBehavior implements IBehavior {
    name = "keycontrol";

    constructor() {
    }

    tick(PerformanceNow: number): any {
        return null;
    }
}