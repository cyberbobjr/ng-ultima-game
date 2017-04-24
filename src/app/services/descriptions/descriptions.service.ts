import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import * as _ from "lodash";

@Injectable()
export class DescriptionsService {
    informationsText$: Subject<{ text: string, color: string }> = new Subject();

    constructor() {
    }

    addTextToInformation(informationToDisplay: string | Array<string>, color: string = "white") {
        if (_.isArray(informationToDisplay)) {
            _.map(informationToDisplay, (information: string) => {
                this.informationsText$.next({text: information, color: color});
            });
        } else {
            this.informationsText$.next({text: <string>informationToDisplay, color: color});
        }
    }

    addLogInformation(logInformation: string, color: string = "white") {
        this.informationsText$.next({text: logInformation, color: color});
    }
}
