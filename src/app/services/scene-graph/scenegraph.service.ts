import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Position} from "../../classes/position";
import {GameMap} from "../../classes/game_map";
import {Entity} from "../../classes/entity";
import {MapsService} from "../maps/maps.service";
import {RenderableSystem} from "../../systems/renderable.system";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {ITile} from "../../interfaces/ITile";

@Injectable()
export class ScenegraphService {
  visibleWindow$: Subject<Array<ITile>[][]> = new Subject();
  visibleWindow: Array<ITile>[][] = [];
  fov_map: Array<Array<boolean>> = [[]];

  map: GameMap;

  maxVisiblesCols: number;
  maxVisiblesRows: number;

  cameraStartPosition: Position = new Position();
  cameraEndPosition: Position = new Position();

  entityCenter: Entity = null;

  constructor(private _renderableService: RenderableSystem,
              private _mapService: MapsService) {
    // initiate fov map
    this.fov_map = new Array(256);
    for (let i = 0; i < (256); i++) {
      this.fov_map[i] = new Array(256);
    }
  }

  setMaxVisibleColsAndRows(maxWidth: number, maxHeight: number) {
    this.maxVisiblesCols = maxWidth;
    this.maxVisiblesRows = maxHeight;
  }

  setMap(map: GameMap, cameraStartPosition?: Position) {
    this.map = map;
    if (cameraStartPosition !== undefined) {
      this.cameraStartPosition = cameraStartPosition;
    }
  }

  getVisiblesTilesAtPositions(position: Position): Array<ITile> {
    return this.visibleWindow[position.row][position.col];
  }

  refresh() {
    console.log("refresh scene");
    try {
      if (this.entityCenter !== null) {
        this._centerCameraOnEntity();
      }
      this._computeVisibleWindow();
      this._computeFov();
      this._copyTilesToVisibleWindow();
      this._refreshVisibleWindow();
    } catch (error) {
      console.log(error);
    }
  }

  private _computeVisibleWindow() {
    console.log("_computeVisibleWindow scene");
    this.cameraEndPosition.col = this.cameraStartPosition.col + this.maxVisiblesCols + 1;
    this.cameraEndPosition.row = this.cameraStartPosition.row + this.maxVisiblesRows + 1;

    if (this.cameraEndPosition.col > this.map.getWidthMap()) {
      this.cameraEndPosition.col = this.map.getWidthMap();
    }
    if (this.cameraEndPosition.row > this.map.getHeightMap()) {
      this.cameraEndPosition.row = this.map.getHeightMap();
    }
  }

  private _copyTilesToVisibleWindow() {
    let visibileColIndex = 0;
    let visibleRowIndex = 0;
    for (let y = this.cameraStartPosition.row; y <= this.cameraEndPosition.row; y++) {
      this.visibleWindow[visibleRowIndex] = [];
      for (let x = this.cameraStartPosition.col; x <= this.cameraEndPosition.col; x++) {
        if (this.fov_map[x][y]) {
          this.visibleWindow[visibleRowIndex][visibileColIndex] = this._getTilesAtPosition(new Position(x, y));
        } else {
          this.visibleWindow[visibleRowIndex][visibileColIndex] = [];
        }
        visibileColIndex++;
      }
      visibleRowIndex++;
      visibileColIndex = 0;
    }
  }

  private _getTilesAtPosition(position: Position): Array<ITile> {
    let tiles: Array<ITile> = [];
    let mapTile = this._mapService.getTileAtPosition(position);
    if (mapTile) {
      tiles.push(mapTile);
    }

    let entityTiles = this._renderableService.getRenderableTilesAtPosition(position);
    if (entityTiles.length > 0) {
      for (let actor of entityTiles) {
        tiles.push(actor);
      }
    }
    return tiles;
  }

  private _getCenterEntityPosition() {
    if (this.entityCenter.hasBehavior("position")) {
      let entityPosition = <PositionBehavior>this.entityCenter.getBehavior("position");
      return entityPosition.position;
    } else {
      throw new Error("Entity don't have position behavior");
    }
  }

  private _computeFov() {
    let playerPosition: Position = this._getCenterEntityPosition();
    let visibileColIndex = 0;
    let visibleRowIndex = 0;
    for (let y = this.cameraStartPosition.row; y <= this.cameraEndPosition.row; y++) {
      for (let x = this.cameraStartPosition.col; x <= this.cameraEndPosition.col; x++) {
        this._calcStraightLine(playerPosition, new Position(x, y));
        visibileColIndex++;
      }
      visibleRowIndex++;
      visibileColIndex = 0;
    }
  }

  private _refreshVisibleWindow() {
    console.log("_refreshVisibleWindow");
    this.visibleWindow$.next(this.visibleWindow);
  }

  setCenterCameraOnEntity(entity: Entity) {
    if (entity.hasBehavior("position")) {
      this.entityCenter = entity;
    } else {
      throw new Error("Entity don't have position behavior");
    }
  }

  private _centerCameraOnEntity() {
    let positionBahvior = <PositionBehavior>this.entityCenter.getBehavior("position");
    let entityPosition = positionBahvior.position;
    this.setCameraPosition(entityPosition);
  }

  setCameraPosition(cameraPosition: Position) {
    this.cameraStartPosition.col = cameraPosition.col - (this.maxVisiblesCols / 2);
    this.cameraStartPosition.row = cameraPosition.row - (this.maxVisiblesRows / 2);
    if (this.cameraStartPosition.col < 0) {
      this.cameraStartPosition.col = 0;
    }
    if (this.cameraStartPosition.row < 0) {
      this.cameraStartPosition.row = 0;
    }
  }

// x0,y0 = player coord
// x1,y1 = destination point
  private _calcStraightLine(playerPostion: Position, targetPosition: Position) {
    let x0 = playerPostion.col;
    let y0 = playerPostion.row;
    let x1 = targetPosition.col;
    let y1 = targetPosition.row;

    let visible = true;
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    while (true) {
      // Do what you need to for this
      /*      if ((player_data_x != x0) || (player_data_y != y0)) {*/
      if (this._mapService.isTileAtPositionBlockVisible(new Position(x0, y0))) {
        this.fov_map[x0][y0] = visible;
      } else {
        this.fov_map[x0][y0] = visible;
        visible = false;
      }
      /*      }
       else {
       fov_map[y0][x0] = true;
       }*/

      if ((x0 === x1) && (y0 === y1)) {
        break;
      }

      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }    // Define differences and error check
  }
}
