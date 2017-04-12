import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class DescriptionsService {
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
