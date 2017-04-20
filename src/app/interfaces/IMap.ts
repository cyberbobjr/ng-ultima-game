export interface IMapMetaData {
    fname: string;
    id: number;
    borderbehavior: string;
    music: number;
    tileset: string;
    tilebase: string;
    levels: number;
    width: number;
    height: number;
    type: string;
    "city": {
        "personrole": [
            {
                "role": string,
                "id": string
            }
            ],
        "name": string,
        "type": string,
        "tlkfname": string
    };
};
