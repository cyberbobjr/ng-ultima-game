import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {RouterModule, Routes} from "@angular/router";

import {AppComponent} from "./app.component";
import {MapCmpComponent} from "./ui/map-cmp/map-cmp.component";
import {MapsService} from "./services/maps/maps.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {PlayerService} from "./services/player/player.service";
import {HotkeyModule} from "angular2-hotkeys";
import {DescriptionComponent} from "./ui/description/description.component";
import {EntitiesService} from "./services/entities/entities.service";
import {RenderableSystem} from "./systems/renderable.system";
import {KeyboardinputSystem} from "app/systems/keyboardinput.system";
import {MovementSystem} from "./systems/movement.system";
import {MainscreenComponent} from "./screens/mainscreen/mainscreen.component";
import {StartscreenComponent} from "./screens/startscreen/startscreen.component";
import {SavestateSystem} from "./systems/savestate.system";

const appRoutes: Routes = [
    {path: "", component: StartscreenComponent},
    {path: "main", component: MainscreenComponent}
];

@NgModule({
              declarations: [
                  AppComponent,
                  MapCmpComponent,
                  DescriptionComponent,
                  MainscreenComponent,
                  StartscreenComponent
              ],
              imports: [
                  BrowserModule,
                  FormsModule,
                  HttpModule,
                  HotkeyModule.forRoot(),
                  RouterModule.forRoot(appRoutes)
              ],
              providers: [MapsService,
                          EntitiesService,
                          RenderableSystem,
                          TilesLoaderService,
                          ScenegraphService,
                          PlayerService,
                          KeyboardinputSystem,
                          MovementSystem,
                          SavestateSystem
              ],
              bootstrap: [AppComponent]
          })
export class AppModule {
}
