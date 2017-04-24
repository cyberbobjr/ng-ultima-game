import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";
import * as _ from "lodash";
import {IMapMetaData} from "../../interfaces/IMap";
import {EntityFactoryService} from "../entityFactory/entityFactory.service";
import {TalkBehavior} from "../../behaviors/talk-behavior";
import {INpc, ITalkTexts} from "../../interfaces/INpc";

@Injectable()
export class EntitiesService {
    private _entitiesForAllMaps: Map<number, Array<Entity>> = new Map();
    private _player: Entity;

    constructor(private _entityFactory: EntityFactoryService) {
    }

    addEntityForMapId(entity: Entity, mapId: number) {
        let entities: Array<Entity> = this.getEntitiesForMapId(mapId);
        entities.push(entity);
        this._entitiesForAllMaps.set(mapId, entities);
    }

    addPlayer(playerEntity: Entity) {
        this._player = playerEntity;
    }

    getPlayer(): Entity {
        return this._player;
    }

    getEntitiesForMapId(mapId: number): Array<Entity> {
        let entities: Array<Entity> = this._entitiesForAllMaps.get(_.toString(mapId));
        if (!entities) {
            entities = [];
        }
        return entities;
    }

    getEntitiesAtPosition(position: Position): Array<Entity> {
        let entities: Array<Entity> = this.getEntitiesForMapId(position.mapId);
        entities = _.concat(entities, this._player);
        return _.filter(entities, (entity: Entity) => {
            if (entity.hasBehavior("position")) {
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                return positionBehavior.position.isEqual(position);
            }
            return false;
        });
    }

    getEntityAtPosition(position: Position): Entity {
        let entities: Array<Entity> = this.getEntitiesForMapId(position.mapId);
        return _.find(entities, (entity: Entity) => {
            if (position.isEqual(entity.getPosition())) {
                return entity;
            }
        });
    }

    private _loadTlkFile(tlkFilename: string) {
        return fetch("/assets/npcs/" + tlkFilename)
            .then((res: any) => {
                return res.json();
            })
            .then((jsonValue: any) => {
                return <Array<INpc>>jsonValue;
            });
    }

    loadAllEntitiesForMaps(maps: Array<IMapMetaData>): Promise<boolean> {
        return _.map(maps, (map: IMapMetaData) => {
            return new Promise((resolve, reject) => {
                if (map["city"]) {
                    this._loadTlkFile(map["city"]["tlkfname"])
                        .then((talks: Array<INpc>) => {
                            this._createNpcsFromTalks(talks, map);
                        });
                }
                resolve(true);
            });
        });
    }

    private _createNpcsFromTalks(npcs: Array<INpc>, mapMetaData: IMapMetaData) {
        _.map(npcs, (npc: INpc) => {
            let name: string = "";
            let entityPosition: Position = new Position(npc.y_pos1, npc.x_pos1, mapMetaData.id);
            if (!_.has(npc, "talks")) {
                name = "vendor";
            } else {
                name = npc.talks.name;
            }
            let entity = this._entityFactory.createNpc(entityPosition, npc.tile1, name, npc.move);
            if (_.has(npc, "talks") && _.size(npc["talks"]) > 0) {
                entity.addBehavior(new TalkBehavior(entity, <INpc>npc));
            }
            this.addEntityForMapId(entity, mapMetaData.id);
        });
    }
}
