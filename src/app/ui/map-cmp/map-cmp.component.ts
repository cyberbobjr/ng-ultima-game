import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ScenegraphService} from "../../services/scene-graph/scenegraph.service";
import {Position} from "../../classes/position";
import {TilesLoaderService} from "../../services/tiles/tiles.service";
import {Tile} from "../../classes/tile";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

@Component({
               selector: "app-map-cmp",
               templateUrl: "./map-cmp.component.html",
               styleUrls: ["./map-cmp.component.css"]
           })
export class MapCmpComponent implements OnInit, AfterViewInit {
    @ViewChild("html5map") public canvas: ElementRef;
    ctx: CanvasRenderingContext2D;
    num_tiles_x;
    num_tiles_y;
    canvas_width: number;
    canvas_height: number;

    constructor(private _scene: ScenegraphService, private _tiles: TilesLoaderService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initCanvas();
        this._scene.visibleWindow$.subscribe((map: [Tile][][]) => {
            this.draw(map);
        });
        this._scene.refresh();
    }

    initCanvas() {
        console.log("init canvas");
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.ctx = canvasEl.getContext("2d");
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        // size of the map
    };

    initNumTiles() {
        this.num_tiles_x = this.canvas_width / TILE_WIDTH;
        this.num_tiles_y = this.canvas_height / TILE_HEIGHT;
    }

    draw(map: [Tile][][]) {
        for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
            for (let colIndex = 0; colIndex < map[rowIndex].length; colIndex++) {
                this._drawTileAtPosition(new Position(colIndex, rowIndex));
            }
        }
    }

    _drawTileAtPosition(position: Position) {
        const tiles = this._scene.getVisiblesTilesAtPositions(position);
        for (let tile of tiles) {
            this._drawTile(tile.getCurrentTile(), position);
        }
    }

    _drawTile(tileNumber: number, position: Position) {
        const tileImage = this._tiles.getTileAtIndex(tileNumber);
        this.ctx.drawImage(tileImage, position.col * TILE_WIDTH, position.row * TILE_HEIGHT);
    }
}
