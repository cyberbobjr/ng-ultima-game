import {IVendorItem} from "./IVendorItem";
export interface IVendorInfo {
    id: string;
    name: string;
    owner: string;
    inventory: Array<IVendorItem>;
}
