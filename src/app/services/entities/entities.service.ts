import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";
import * as _ from "lodash";
import {IMap} from "../../interfaces/IMap";
import {ITalk} from "../../interfaces/ITalk";
import {EntityFactoryService} from "../entityFactory/entityFactory.service";

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

    getEntitiesForMapId(mapId: number): Array<Entity> {
        let entities: Array<Entity> = this._entitiesForAllMaps.get(mapId);
        if (!entities) {
            entities = [];
        }
        entities = _.concat(entities, this._player);
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

    private _loadTlkFile(tlkFilename: string) {
        return fetch("/assets/npcs/" + tlkFilename)
            .then((res) => {
                return res.json();
            })
            .then((jsonValue: Array<ITalk>) => {
                return jsonValue;
            });
    }

    loadAllEntitiesForMaps(maps: Array<IMap>): Promise<boolean> {
        return _.map(maps, (map: IMap) => {
            return new Promise((resolve, reject) => {
                if (map["city"]) {
                    this._loadTlkFile(map["city"]["tlkfname"])
                        .then((talks: Array<ITalk>) => {
                            this._createNpcsFromTalks(talks, map);
                        });
                }
                resolve(true);
            });
        });
    }

    private _createNpcsFromTalks(talks: Array<ITalk>, mapMetaData: IMap) {
        _.map(talks, (talk: ITalk) => {
            let name: string = "";
            let entityPosition: Position = new Position(talk.y_pos1, talk.x_pos1, mapMetaData.id);
            if (!_.has(talk, "talks")) {
                name = "vendor";
            } else {
                name = talk.talks.name;
            }
            let entity = this._entityFactory.createNpc(entityPosition, talk.tile1, name, talk.move);
            this.addEntityForMapId(entity, mapMetaData.id);
        });
    }

}
