import {Injectable} from "@angular/core";
import {ReplaySubject, Subject} from "rxjs";

@Injectable()
export class InformationsService {
    informationsText$: Subject<string> = new Subject();

    constructor() {
    }

    addTextToInformation(information: string) {
        this.informationsText$.next(information);
    }

    addLogInformation(logInformation: string) {
        this.informationsText$.next(logInformation);
    }
}
