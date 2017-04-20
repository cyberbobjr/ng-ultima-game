import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ScenegraphService} from "../../services/scene-graph/scenegraph.service";
import {Position} from "../../classes/position";
import {ITile} from "../../interfaces/ITile";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

@Component({
    selector: "app-map-cmp",
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit, AfterViewInit {
    @ViewChild("html5map") public canvas: ElementRef;
    ctx: CanvasRenderingContext2D;
    num_tiles_x;
    num_tiles_y;
    canvas_width: number;
    canvas_height: number;

    constructor(private _scene: ScenegraphService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initCanvas();
        this._scene.visibleWindow$.subscribe((map: [ITile][][]) => {
            this.draw(map);
        });
        this._scene.refresh();
    }

    initCanvas() {
        console.log("init canvas");
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.ctx = canvasEl.getContext("2d");
        this._fillCanvasBlack();
    };

    private _fillCanvasBlack() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    }

    initNumTiles() {
        this.num_tiles_x = this.canvas_width / TILE_WIDTH;
        this.num_tiles_y = this.canvas_height / TILE_HEIGHT;
    }

    draw(map: [ITile][][]) {
        this._fillCanvasBlack();
        for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
            for (let colIndex = 0; colIndex < map[rowIndex].length; colIndex++) {
                this._drawTileAtPosition(new Position(rowIndex, colIndex));
            }
        }
    }

    _drawTileAtPosition(position: Position) {
        const tiles = this._scene.getVisiblesTilesAtPositions(position);
        if (tiles.length === 0) {
            this._drawBlackTileAtPosition(position);
        } else {
            for (let tile of tiles) {
                let tileImage: HTMLImageElement = tile.image;
                this._drawTile(tileImage, position, tile.currentFrame);
            }
        }
    }

    _drawTile(tileImage: HTMLImageElement, position: Position, currentFrame: number) {
        let yOrigin: number = currentFrame * TILE_HEIGHT;
        let [yDestination, xDestination] = [position.row * TILE_HEIGHT,
                                            position.col * TILE_WIDTH];
        this.ctx.drawImage(tileImage, 0, yOrigin, TILE_WIDTH, TILE_HEIGHT, xDestination, yDestination, TILE_WIDTH, TILE_HEIGHT);
    }

    _drawBlackTileAtPosition(position: Position) {
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(position.col * TILE_WIDTH, position.row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    }
}
