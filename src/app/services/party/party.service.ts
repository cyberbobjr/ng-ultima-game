import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Observable} from "rxjs";

@Injectable()
export class PartyService {
    party: Array<Entity> = [];
    party$: Observable<Array<Entity>>;
    observer: any;

    constructor() {
        this.party$ = new Observable((observer) => {
            this.observer = observer;
        }).share();
    }

    addMember(entityToAdd: Entity) {
        this.party.push(entityToAdd);
        this.observer.next(this.party);
    }

    removeMember(entityToRemove: Entity) {

    }

    getMembers(): Array<Entity> {
        return this.party;
    }
}
