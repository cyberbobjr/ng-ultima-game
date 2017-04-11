import {IBehavior} from "../interfaces/IBehavior";

export class SavestateBehavior implements IBehavior {
    name = "savestate";
    private _storageKey: string = "";

    constructor(storageKey: string) {
        this._storageKey = `ng-ultima ${storageKey}`;
    }

    tick(): any {
        return null;
    }

    getStorageKey() {
        return this._storageKey;
    }

    storeKeyValue(key: string, value: any) {
        window.localStorage.setItem(`${this._storageKey}.${key}`, JSON.stringify(value));
    }

    loadKey(key: string) {
        return JSON.parse(window.localStorage.getItem(`${this._storageKey}.${key}`));
    }
}
