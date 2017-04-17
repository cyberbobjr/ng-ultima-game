import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";
import * as _ from "lodash";
import {ITile} from "../../interfaces/ITile";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";
import {IMap} from "../../interfaces/IMap";
import {ITalk} from "../../interfaces/ITalk";
import {EntityFactoryService} from "../entityFactory/entityFactory.service";

@Injectable()
export class EntitiesService {
    private _entities: Array<Entity> = [];
    private _player: Entity;

    constructor(private _entityFactory: EntityFactoryService) {
    }

    addEntity(entity: Entity) {
        this._entities.push(entity);
    }

    getPositionOfEntity(entity: Entity): Position {
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        return positionBehavior.position;
    }

    getEntitiesAtPosition(position: Position): Array<Entity> {
        return _.filter(this._entities, (entity: Entity) => {
            if (entity.hasBehavior("position")) {
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                return positionBehavior.position.isEqual(position);
            }
            return false;
        });
    }

    getEntitiesTiles(entities: Array<Entity>): Array<ITile> {
        return _.map(entities, (entity: Entity) => {
            if (entity.hasBehavior("renderable")) {
                return this._getRenderableTile(entity);
            }
        });
    }

    private _getRenderableTile(entity: Entity): ITile {
        let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
        return renderableBehavior.getTile();
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

    loadAllEntitiesForMap(metaData: IMap): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._loadTlkFile(metaData["city"]["tlkfname"])
                .then((talks: Array<ITalk>) => {
                    this._createNpcsFromTalks(talks, metaData);
                    resolve(true);
                });
        });
    }

    private _createNpcsFromTalks(talks: Array<ITalk>, mapMetaData: IMap) {
        _.map(talks, (talk: ITalk) => {
            let entity = this._entityFactory.createNpc(new Position(talk.y_pos1, talk.x_pos1, mapMetaData.id), talk.tile1, talk.talks.name);
            this._entities.push(entity);
        });
    }

    setPlayerEntity(player: Entity) {
        this._player = player;
    }
}
